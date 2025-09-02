import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Define the structure for entrants
type Entrant = {
  email: string
  firstName: string
  lastName: string
  businessName?: string
}

// Configuration
const KYC_TEAM_ID = process.env.KYC_TEAM_ID

if (!KYC_TEAM_ID) {
  throw new Error("KYC_TEAM_ID environment variable is required")
}

// Array of entrants - edit this with your actual data
const SAMPLE_ENTRANTS: Entrant[] = [
  {
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    businessName: "Doe Enterprises",
  },
  {
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
  },
  // Add more entrants as needed
]

async function createKYCUsers(entrants: Entrant[], kycTeamId: string) {
  console.log(`Creating KYC users for team ${kycTeamId}...`)
  console.log(`Total entrants to process: ${entrants.length}`)

  // Separate individuals and businesses as required by addKYCTeamMembers
  const individuals = entrants
    .filter((entrant) => !entrant.businessName)
    .map((entrant) => ({
      firstName: entrant.firstName,
      lastName: entrant.lastName,
      email: entrant.email,
    }))

  const businesses = entrants
    .filter((entrant) => entrant.businessName)
    .map((entrant) => ({
      firstName: entrant.firstName,
      lastName: entrant.lastName,
      email: entrant.email,
      companyName: entrant.businessName!,
    }))

  console.log(`Individuals: ${individuals.length}`)
  console.log(`Businesses: ${businesses.length}`)

  try {
    await addKYCTeamMembers({
      kycTeamId,
      individuals,
      businesses,
    })

    console.log("Successfully created KYC users and team relationships!")
  } catch (error) {
    console.error("Error creating KYC users:", error)
    throw error
  }
}

async function main() {
  try {
    // Verify the KYC team exists
    const kycTeam = await prisma.kYCTeam.findUnique({
      where: { id: KYC_TEAM_ID },
    })

    if (!kycTeam) {
      throw new Error(`KYC team with ID ${KYC_TEAM_ID} not found`)
    }

    console.log(`Found KYC team: ${kycTeam.walletAddress}`)

    // Use the hardcoded entrants array
    const entrants = SAMPLE_ENTRANTS

    if (entrants.length === 0) {
      console.log("No entrants to process")
      return
    }

    // Create KYC users and team relationships using existing logic
    await createKYCUsers(entrants, KYC_TEAM_ID!)

    console.log("Script completed successfully!")
  } catch (error) {
    console.error("Script failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()

async function addKYCTeamMembers({
  kycTeamId,
  individuals,
  businesses,
}: {
  kycTeamId: string
  individuals: {
    firstName: string
    lastName: string
    email: string
  }[]
  businesses: {
    firstName: string
    lastName: string
    email: string
    companyName: string
  }[]
}) {
  const allEmails = [
    ...individuals.map((i) => i.email),
    ...businesses.map((b) => b.email),
  ]

  const [existingUsers, currentTeam] = await Promise.all([
    prisma.kYCUser.findMany({
      where: { email: { in: allEmails } },
      include: {
        KYCUserTeams: true,
      },
    }),
    prisma.kYCUserTeams.findMany({
      where: { kycTeamId, team: { deletedAt: null } },
    }),
  ])

  const existingIndividualUserMap = new Map(
    existingUsers.filter((u) => !u.businessName).map((u) => [u.email, u]),
  )
  const existingBusinessUserMap = new Map(
    existingUsers.filter((u) => u.businessName).map((u) => [u.email, u]),
  )

  const newIndividuals = individuals.filter(
    (i) => !existingIndividualUserMap.get(i.email),
  )
  const newBusinesses = businesses.filter(
    (b) => !existingBusinessUserMap.get(b.email),
  )

  // We need to remove users that are no longer in the team
  const toRemove = [
    // Remove users that are no longer in the team but their email is still used for individuals or businesses
    ...existingUsers
      .filter((u) => u.KYCUserTeams.some((t) => t.kycTeamId === kycTeamId))
      .filter((u) => {
        const isIndividualMember =
          !u.businessName && individuals.some((i) => i.email === u.email)
        const isBusinessMember =
          !!u.businessName && businesses.some((b) => b.email === u.email)
        return !isIndividualMember && !isBusinessMember
      })
      .map((u) => u.KYCUserTeams.find((t) => t.kycTeamId === kycTeamId)!.id),
    // Remove users that are no longer in the team & their email is not used for individuals or businesses
    ...currentTeam
      .filter((t) => !existingUsers.some((e) => e.id === t.kycUserId))
      .map((t) => t.id),
  ]

  // We need to add some existing users & all new users to the team
  const toAdd = existingUsers
    .filter((u) => u.KYCUserTeams.every((t) => t.kycTeamId !== kycTeamId))
    .filter((u) => {
      const isNewIndividual =
        !u.businessName && newIndividuals.some((i) => i.email === u.email)
      const isNewBusiness =
        !!u.businessName && newBusinesses.some((b) => b.email === u.email)
      return !isNewIndividual && !isNewBusiness
    })

  await prisma.$transaction(async (tx) => {
    const createdIndividuals = await tx.kYCUser.createManyAndReturn({
      data: newIndividuals.map((i) => ({
        email: i.email,
        firstName: i.firstName,
        lastName: i.lastName,
        expiry: new Date(),
      })),
    })

    const createdBusinesses = await tx.kYCUser.createManyAndReturn({
      data: newBusinesses.map((b) => ({
        email: b.email,
        firstName: b.firstName,
        lastName: b.lastName,
        expiry: new Date(),
        businessName: b.companyName,
      })),
    })

    const allMembers = [...toAdd, ...createdIndividuals, ...createdBusinesses]

    await Promise.all([
      tx.kYCUserTeams.createMany({
        data: allMembers.map((u) => ({
          kycTeamId,
          kycUserId: u.id,
        })),
      }),
      tx.kYCUserTeams.deleteMany({
        where: {
          id: { in: toRemove },
        },
      }),
    ])
  })
}
