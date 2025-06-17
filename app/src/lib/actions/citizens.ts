"use server"

import { Citizen } from "@prisma/client"

import { auth } from "@/auth"
import {
  getCitizenByType,
  getCitizenCountByType,
  upsertCitizen,
} from "@/db/citizens"
import { prisma } from "@/db/client"
import { getAdminOrganizations, getOrganization } from "@/db/organizations"
import { getProject, getUserAdminProjectsWithDetail } from "@/db/projects"
import { getUserById } from "@/db/users"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TAGS,
  CITIZEN_TYPES,
} from "@/lib/constants"
import { CitizenLookup, CitizenshipQualification } from "@/lib/types"

import { updateMailchimpTags } from "../api/mailchimp"
import { createCitizenAttestation } from "../eas"

interface S8QualifyingUser {
  address: string
}

interface S8QualifyingChain {
  organizationId: string
}

interface S8QualifyingProject {
  projectId: string
}

export const s8CitizenshipQualification =
  async (): Promise<CitizenshipQualification | null> => {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const user = await getUserById(userId)
    if (!user) {
      return null
    }

    const [userOrgs, userProjects] = await Promise.all([
      getAdminOrganizations(userId),
      getUserAdminProjectsWithDetail({ userId }),
    ])

    // ------------------------------------------------------------
    // Organization (Chain) qualification
    const qualifyingChains = await prisma.$queryRaw<S8QualifyingChain[]>`
    SELECT * FROM "S8QualifyingChain"
    WHERE "organizationId" = ANY(${
      userOrgs?.organizations.map((org) => org.organization.id) || []
    })
  `

    if (qualifyingChains.length > 0) {
      const existingCitizen = await prisma.citizen.findFirst({
        where: {
          organizationId: qualifyingChains[0].organizationId,
          attestationId: {
            not: null,
          },
        },
      })

      // Get the organization
      const organization = await getOrganization({
        id: qualifyingChains[0].organizationId,
      })

      // If the organization already has a citizen, return not eligible
      if (existingCitizen && organization) {
        return {
          type: CITIZEN_TYPES.chain,
          identifier: organization.id,
          title: organization.name,
          avatar: organization.avatarUrl,
          eligible: false,
          error: `${organization.name} is already registered`,
        }
      }

      // Only one citizen per organization
      if (!existingCitizen && organization) {
        return {
          type: CITIZEN_TYPES.chain,
          identifier: organization.id,
          title: organization.name,
          avatar: organization.avatarUrl,
          eligible: true,
        }
      }
    }

    // ------------------------------------------------------------
    // Project (App) qualification
    const projectIds =
      userProjects?.projects.map(({ project }) => project.id) || []

    const qualifyingProjects = await prisma.$queryRaw<S8QualifyingProject[]>`
    SELECT * FROM "S8QualifyingProject"
    WHERE "projectId" = ANY(${projectIds})
  `

    if (qualifyingProjects.length > 0) {
      // Check if any of the qualifying projects already has a citizen
      const projectsWithCitizens = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM "Project" p
      INNER JOIN "Citizen" c ON c."projectId" = p.id 
      WHERE p.id = ANY(${qualifyingProjects.map(
        (p: S8QualifyingProject) => p.projectId,
      )})
    `
      // Get the first qualifying project
      const project = await getProject({ id: qualifyingProjects[0].projectId })

      // If any project has a citizen, return not eligible
      if (projectsWithCitizens.length > 0 && project) {
        return {
          type: CITIZEN_TYPES.app,
          identifier: project.id,
          title: project.name,
          avatar: project.thumbnailUrl,
          eligible: false,
          error: `${project.name} is already registered`,
        }
      }

      if (project) {
        return {
          type: CITIZEN_TYPES.app,
          identifier: project.id,
          title: project.name,
          avatar: project.thumbnailUrl,
          eligible: true,
        }
      }
    }

    // ------------------------------------------------------------
    // User qualification

    // Check if user already has a citizen profile
    const existingCitizen = await getCitizenByType({
      type: CITIZEN_TYPES.user,
      id: userId,
    })

    if (existingCitizen && existingCitizen.attestationId) {
      return {
        type: CITIZEN_TYPES.user,
        identifier: user.id,
        title: "You",
        avatar: user.imageUrl || "",
        eligible: false,
        error: "User already registered",
      }
    }

    const qualifyingAddress = await prisma.$queryRaw<S8QualifyingUser[]>`
    SELECT * FROM "S8QualifyingUser"
    WHERE address = ANY(${user.addresses.map(
      (addr: { address: string }) => addr.address,
    )})
  `

    if (qualifyingAddress.length > 0) {
      return {
        type: CITIZEN_TYPES.user,
        identifier: user.id,
        title: "You",
        avatar: user.imageUrl || "",
        eligible: true,
      }
    }

    return {
      type: CITIZEN_TYPES.user,
      identifier: user.id,
      title: "You",
      avatar: user.imageUrl || "",
      eligible: false,
      error: "Sorry, you are not eligible to become a Citizen",
    }
  }

// S8 Citizenship Limit Check
export const checkCitizenshipLimit = async (): Promise<boolean> => {
  const citizenCount = await getCitizenCountByType(CITIZEN_TYPES.user)
  return citizenCount >= 1100
}

export const updateCitizen = async (citizen: {
  type: string
  address: string
  attestationId?: string
  timeCommitment?: string
}) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    const result = await upsertCitizen({
      id: userId,
      citizen,
    })

    return result
  } catch (error) {
    console.error("Error updating citizen:", error)
    return {
      error: "Failed to update citizen",
    }
  }
}

export const getCitizen = async (
  lookup: CitizenLookup,
): Promise<Citizen | null> => {
  return await getCitizenByType(lookup)
}

export const attestCitizen = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const qualification = await s8CitizenshipQualification()

  if (!qualification?.eligible) {
    return {
      error: qualification?.error || "You are not eligible to become a Citizen",
    }
  }

  const citizenType =
    CITIZEN_TYPES[qualification.type as keyof typeof CITIZEN_TYPES]
  if (!citizenType) {
    return {
      error: "Invalid citizen type",
    }
  }

  const user = await getUserById(userId)
  if (!user) {
    return {
      error: "User not found",
    }
  }

  const primaryAddress = user.addresses.find(
    (addr: { primary: boolean; address: string }) => addr.primary,
  )?.address

  if (!primaryAddress) {
    return {
      error: "No governance address set",
    }
  }

  try {
    const attestationId = await createCitizenAttestation({
      to: primaryAddress,
      farcasterId: parseInt(user?.farcasterId || "0"),
      selectionMethod:
        CITIZEN_ATTESTATION_CODE[
          citizenType as keyof typeof CITIZEN_ATTESTATION_CODE
        ],
      refUID:
        qualification.type === CITIZEN_TYPES.chain ||
        qualification.type === CITIZEN_TYPES.app
          ? qualification.identifier
          : undefined,
    })

    const isValidAttestationId = /^0x[a-fA-F0-9]{64}$/.test(attestationId)
    if (!isValidAttestationId) {
      return {
        error: "Invalid attestation ID format",
      }
    }

    await upsertCitizen({
      id: userId,
      citizen: {
        address: primaryAddress,
        attestationId,
        type: citizenType,
        projectId:
          qualification.type === CITIZEN_TYPES.app
            ? qualification.identifier
            : null,
        organizationId:
          qualification.type === CITIZEN_TYPES.chain
            ? qualification.identifier
            : null,
      },
    })

    await updateMailchimpTags([
      {
        email: user.emails[0].email,
        tags: [CITIZEN_TAGS[citizenType]],
      },
    ])
  } catch (error) {
    console.error("Error attesting citizen:", error)
    return {
      error: "Failed to attest citizen",
    }
  }
}

export const isS7Citizen = async (id: string): Promise<boolean> => {
  const user = await getUserById(id)
  if (!user) {
    return false
  }

  const s7CitizenAddresses = await getS7CitizenAddresses()
  const hasS7CitizenAddress = s7CitizenAddresses.some((address) =>
    user.addresses.some(
      (addr: { address: string }) => addr.address === address,
    ),
  )

  return Boolean(hasS7CitizenAddress)
}

// S7 Citizens
// https://optimism.easscan.org/schema/view/0xc35634c4ca8a54dce0a2af61a9a9a5a3067398cb3916b133238c4f6ba721bc8a
const getS7CitizenAddresses = async () => {
  return [
    "0x585639fBf797c1258eBA8875c080Eb63C833d252",
    "0x3DB5b38ef4b433D9C6A664Bd35551BE73313189A",
    "0xad4f365A550835D40dc2E95FDffa1E4edd3FBE14",
    "0xF68D2BfCecd7895BBa05a7451Dd09A1749026454",
    "0x06F455e2C297a4Ae015191FA7A4A11C77c5b1b7c",
    "0x64FeD9e56B548343E7bb47c49ecd7FFa9f1A34FE",
    "0x6Dc43be93a8b5Fd37dC16f24872BaBc6dA5E5e3E",
    "0x378c23B326504Df4d29c81BA6757F53b2c59f315",
    "0xeF32eb37f3E8B4bDDdF99879b23015F309ED7304",
    "0x801707059a55D748b23b02043c71b7A3D976F071",
    "0x9C949881084dCbd97237f786710aB8e52a457136",
    "0x9194eFdF03174a804f3552F4F7B7A4bB74BaDb7F",
    "0x55aEd0ce035883626e536254dda2F23a5b5D977f",
    "0xB0623C91c65621df716aB8aFE5f66656B21A9108",
    "0x94Db037207F6fB697DBd33524aaDffD108819DC8",
    "0x308fedfb88F6E85F27b85c8011cCb9b5e15BCbF7",
    "0xdb5781a835b60110298fF7205D8ef9678Ff1f800",
    "0x665d84FFFddd72D24Df555E6b065B833478DfFCa",
    "0x53e0B897EAE600B2F6855FCe4a42482E9229D2c2",
    "0x399e0Ae23663F27181Ebb4e66Ec504b3AAB25541",
    "0x146cfED833cC926B16B0dA9257E8A281c2add9F3",
    "0x0000006916a87b82333f4245046623b23794C65C",
    "0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc",
    "0xe422d6C46a69e989BA6468CcD0435Cb0c5C243E3",
    "0x60Fa1C89819c807C25d2B388117099Fde74C9cb3",
    "0x5555763613a12D8F3e73be831DFf8598089d3dCa",
    "0x45a10F35BeFa4aB841c77860204b133118B7CcAE",
    "0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF",
    "0x12681667BB220521C222F50ECE5Eb752046bc144",
    "0x9934465Ee73BeAF148b1b3Ff232C8cD86c4c2c63",
    "0xf503017D7baF7FBC0fff7492b751025c6A78179b",
    "0x434F5325DdcdbBfcCE64bE2617c72c4Aa33Ec3E7",
    "0xEee718c1e522ecB4b609265db7A83Ab48ea0B06f",
    "0x66Da63B03feCA7Dd44a5bB023BB3645D3252Fa32",
    "0x75cac0CEb8A39DdB4942A83AD2aAfaF0C2A3e13f",
    "0x07Fda67513EC0897866098a11dC3858089D4A505",
    "0x48A63097E1Ac123b1f5A8bbfFafA4afa8192FaB0",
    "0x91031DCFdEa024b4d51e775486111d2b2A715871",
    "0x7fC80faD32Ec41fd5CfcC14EeE9C31953b6B4a8B",
    "0xa2bbe92f4E320185DD42261897464F60C9A05A35",
    "0xDCF7bE2ff93E1a7671724598b1526F3A33B1eC25",
    "0x1E6D9F536a5d1CC04fC13b3133EFdB90C8EE5ea1",
    "0xBC39FB41Fe0229352774930c5Aa3Bf1635C2665F",
    "0xa142aB9eab9264807A41F0E5cbDab877D204E233",
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    "0x28F569cC6C29D804A1720edC16bF1eBab2eA35B4",
    "0x894Aa5F1E45454677A8560ddE3B45Cb5C427Ef92",
    "0x288C53a1BA857EaD34AD0e79F644087F8174185a",
    "0x396a34c10b11E33a4Bf6F3e6A419A23c54Ad34Fb",
    "0x8Eb9e5E5375b72eE7c5cb786CE8564D854C26A86",
    "0x29C4dbC1a81d06c9AA2fAed93Bb8B4a78F3eabDb",
    "0x1d3bf13f8f7A83390d03Db5E23A950778e1d1309",
    "0xDcF09a83e9Cc4611b2215BFb7116BfAf5e906D3d",
    "0xa3EaC0016f6581AC34768C0D4B99DDcd88071c3C",
    "0xDc0A92c350A52b6583e235a57901B8731aF8B249",
    "0xc2E2B715d9e302947Ec7e312fd2384b5a1296099",
    "0x616caD18642F45d3fa5FCaaD0a2d81764A9cBa84",
    "0xABF28f8D9adFB2255F4a059e37d3BcE9104969dB",
    "0xDaDd7c883288Cfe2E257B0A361865E5e9349808b",
    "0xd35E119782059A27FEAd4EddA8B555f393650BC8",
    "0x839395e20bbB182fa440d08F850E6c7A8f6F0780",
    "0x69E271483C38ED4902a55C3Ea8AAb9e7cc8617E5",
    "0xAC3A69DD4a8fEcC18b172Bfa9643D6b0863819c8",
    "0x15C6AC4Cf1b5E49c44332Fb0a1043Ccab19db80a",
    "0x1de2A056508E0D0dd88A88f1f5cdf9cfa510795c",
    "0x07bF3CDA34aA78d92949bbDce31520714AB5b228",
    "0xcf79C7EaEC5BDC1A9e32D099C5D6BdF67E4cF6e8",
    "0x6EdA5aCafF7F5964E1EcC3FD61C62570C186cA0C",
    "0x69DC230B06A15796e3f42bAF706e0e55d4D5eAA1",
    "0xe53e89d978Ff1da716f80BaA6E6D8B3FA23f2284",
    "0x3B60e31CFC48a9074CD5bEbb26C9EAa77650a43F",
    "0x75536CF4f01c2bFa528F5c74DdC1232Db3aF3Ee5",
    "0xAc469c5dF1CE6983fF925d00d1866Ab780D402A4",
    "0x53C61cfb8128ad59244E8c1D26109252ACe23d14",
    "0xF4B0556B9B6F53E00A1FDD2b0478Ce841991D8fA",
    "0x7899d9b1181cbB427b0b1BE0684C096C260F7474",
    "0x8f07bc36ff569312FDC41F3867D80bBd2FE94b76",
    "0x5872Ce037211233b9F6F5095c25988021f270C21",
    "0x490C91F38Ec57E3ab00811e0C51A62BfED7e81F4",
    "0x634C474A393E4498Bc2F0C1DeE16A50E9E0Ebe2b",
    "0x00409fC839a2Ec2e6d12305423d37Cd011279C09",
    "0x23936429FC179dA0e1300644fB3B489c736D562F",
    "0x5d36a202687fD6Bd0f670545334bF0B4827Cc1E2",
    "0x57893e666BD15E886D74751B0879361A3383b57A",
    "0x17640d0D8C93bF710b6Ee4208997BB727B5B7bc2",
    "0x0331969e189D63fBc31D771Bb04Ab44227D748D8",
    "0xde2b6860cB3212A6a1f8f8628aBfe076723A4B39",
    "0xBF430a49C4d85AeeD3908619D5387A1fbF8E74A9",
    "0xAeb99a255C3A243Ab3e4F654041e9BF5340cF313",
    "0xDd7a79b1b6e8Dd444F99d68a7D493A85556944a2",
    "0x92Bf20563e747B2f8711549Be17A9d7B876c4053",
    "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3",
    "0x73186b2A81952C2340c4eB2e74e89869E1183dF0",
    "0x826976d7C600d45FB8287CA1d7c76FC8eb732030",
    "0xd31b671F1a398B519222FdAba5aB5464B9F2a3Fa",
    "0x14276eB29e90541831cb94C80331484ae6D2A1D8",
    "0x925aFeB19355E289ED1346EDE709633cA8788b25",
    "0x5554672e67bA866B9861701D0e0494AB324aD19A",
    "0x1F5D295778796a8b9f29600A585Ab73D452AcB1c",
    "0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1",
    "0xDb150346155675dd0C93eFd960d5985244a34820",
  ]
}
