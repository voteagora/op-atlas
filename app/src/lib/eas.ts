import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { ethers, Wallet } from "ethers"

import { ProjectWithFullDetails } from "./types"

const ENTITY_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0x5eefb359bc596699202474fd99e92172d1b788aa34280f385c498875d1bfb424"
    : "0xff0b916851c1c5507406cfcaa60e5d549c91b7f642eb74e33b88143cae4b47d0"
const PROJECT_METADATA_SCHEMA_ID =
  "0xe035e3fe27a64c8d7291ae54c6e85676addcbc2d179224fe7fc1f7f05a8c6eac"
const ORGANIZATION_METADATA_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0x9c181f1e683fd2d79287d0b4fe1832f571fb4f5815ff9c1d0ed5b7a9bd067a03"
    : "0xc2b376d1a140287b1fa1519747baae1317cf37e0d27289b86f85aa7cebfd649f"
const APPLICATION_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0xb50a1973d1aab9206545cd1da93e0dc1b5314989928bb35f58762020e2027154"
    : "0x2169b74bfcb5d10a6616bbc8931dc1c56f8d1c305319a9eeca77623a991d4b80"
const CONTRACT_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0x5e84bc14268e9bf1275ed4e796a9903e2c2c8b489a4de5f381a21634fe0fcb9a"
    : "0xe687fc8f419477f1253c99889c28f3aee7e3472a4df28d3d20e88ced6acb1ddc"

const entitySchema = new SchemaEncoder("uint256 farcasterID,string type")
const projectMetadataSchema = new SchemaEncoder(
  "bytes32 projectRefUID,uint256 farcasterID,string name,string category,bytes32 parentProjectRefUID,uint8 metadataType,string metadataUrl",
)
const organizationMetadataSchema = new SchemaEncoder(
  "bytes32 refUID, uint256 farcasterID, string name, bytes32 parentOrgUID, bytes32[] projects, uint8 metadataType, string metadataUrl",
)
const applicationSchema = new SchemaEncoder(
  "string round, uint256 farcasterID, bytes32 metadataSnapshotRefUID, uint8 metadataType, string metadataUrl",
)
const contractSchema = new SchemaEncoder(
  "address contract, uint8 chainId, address deployer, bytes32 deploymentTx, bytes signature, uint8 verificationChainId, uint256 farcasterID",
)

const EAS_SIGNER_PRIVATE_KEY = process.env.EAS_SIGNER_PRIVATE_KEY
if (!EAS_SIGNER_PRIVATE_KEY) {
  throw new Error("EAS_SIGNER_PRIVATE_KEY is missing from env")
}

// Optimism address
const eas =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? new EAS("0xC2679fBD37d54388Ce493F1DB75320D236e1815e")
    : new EAS("0x4200000000000000000000000000000000000021")

const provider = new ethers.AlchemyProvider(
  process.env.NEXT_PUBLIC_ENV === "dev" ? "sepolia" : "optimism",
  process.env.ALCHEMY_API_KEY,
)

const signer = new Wallet(EAS_SIGNER_PRIVATE_KEY, provider)

eas.connect(signer)

async function createAttestation(
  schemaId: string,
  data: string,
  refUID?: string,
) {
  const tx = await eas.attest({
    schema: schemaId,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: true,
      data,
      refUID,
    },
  })

  return await tx.wait()
}

async function createMultiAttestations(
  attestations: {
    schema: string
    data: string
    refUID?: string
  }[],
) {
  const tx = await eas.multiAttest(
    attestations.map((a) => ({
      schema: a.schema,
      data: [
        {
          recipient: "0x0000000000000000000000000000000000000000",
          expirationTime: BigInt(0),
          revocable: true,
          data: a.data,
          refUID: a.refUID,
        },
      ],
    })),
  )

  return await tx.wait()
}

async function revokeMultiAttestations(
  schemaId: string,
  attestationIds: string[],
) {
  const tx = await eas.multiRevoke([
    {
      schema: schemaId,
      data: attestationIds.map((id) => ({ uid: id })),
    },
  ])

  return await tx.wait()
}

export async function createEntityAttestation({
  farcasterId,
  type,
}: {
  farcasterId: number
  type: "project" | "organization"
}) {
  const data = entitySchema.encodeData([
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "type", value: type, type: "string" },
  ])

  const attestationId = await createAttestation(ENTITY_SCHEMA_ID, data)
  console.info("Created entity attestation:", attestationId)

  return attestationId
}

export async function createProjectMetadataAttestation({
  farcasterId,
  projectId,
  name,
  category,
  ipfsUrl,
}: {
  farcasterId: number
  projectId: string
  name: string
  category: string
  ipfsUrl: string
}) {
  const attestation = buildProjectMetadataAttestation({
    farcasterId,
    projectId,
    name,
    category,
    ipfsUrl,
  })

  const attestationId = await createAttestation(
    attestation.schema,
    attestation.data,
    attestation.refUID,
  )

  console.info("Created project metadata attestation:", attestationId)

  return attestationId
}

export async function createOrganizationMetadataAttestation({
  farcasterId,
  organizationId,
  name,
  projectIds,
  ipfsUrl,
}: {
  farcasterId: number
  organizationId: string
  name: string
  projectIds: string[]
  ipfsUrl: string
}) {
  const data = organizationMetadataSchema.encodeData([
    { name: "refUID", value: organizationId, type: "bytes32" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "name", value: name, type: "string" },
    { name: "parentOrgUID", value: "", type: "bytes32" },
    { name: "projects", value: projectIds, type: "bytes32[]" },
    { name: "metadataType", value: "0", type: "uint8" },
    { name: "metadataUrl", value: ipfsUrl, type: "string" },
  ])

  const attestationId = await createAttestation(
    ORGANIZATION_METADATA_SCHEMA_ID,
    data,
    organizationId,
  )
  console.info("Created organization metadata attestation:", attestationId)

  return attestationId
}

export async function createApplicationAttestation({
  farcasterId,
  projectId,
  round,
  snapshotRef,
  ipfsUrl,
}: {
  farcasterId: number
  projectId: string
  round: string
  snapshotRef: string
  ipfsUrl: string
}) {
  const data = applicationSchema.encodeData([
    { name: "round", value: round, type: "string" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "metadataSnapshotRefUID", value: snapshotRef, type: "bytes32" },
    { name: "metadataType", value: "0", type: "uint8" },
    { name: "metadataUrl", value: ipfsUrl, type: "string" },
  ])

  const attestationId = await createAttestation(
    APPLICATION_SCHEMA_ID,
    data,
    projectId,
  )

  return attestationId
}

export async function createContractAttestations({
  contracts,
  projectId,
  farcasterId,
}: {
  contracts: {
    contractAddress: string
    chainId: number
    deployer: string
    deploymentTx: string
    signature: string
    verificationChainId: number
  }[]
  projectId: string
  farcasterId: number
}) {
  const attestations = buildContractAttestations({
    contracts,
    projectId,
    farcasterId,
  })

  const attestationIds = await createMultiAttestations(attestations)

  return attestationIds
}

export async function createFullProjectSnapshotAttestations({
  project,
  contracts,
}: {
  project: {
    farcasterId: number
    projectId: string
    name: string
    category: string
    ipfsUrl: string
  }
  contracts: {
    contractAddress: string
    chainId: number
    deployer: string
    deploymentTx: string
    signature: string
    verificationChainId: number
  }[]
}) {
  const attestations = [
    buildProjectMetadataAttestation({
      farcasterId: project.farcasterId,
      projectId: project.projectId,
      name: project.name,
      category: project.category,
      ipfsUrl: project.ipfsUrl,
    }),
    ...buildContractAttestations({
      contracts,
      projectId: project.projectId,
      farcasterId: project.farcasterId,
    }),
  ]

  return createMultiAttestations(attestations)
}

export async function revokeContractAttestations(attestationIds: string[]) {
  if (attestationIds.length === 0) {
    return
  }
  return await revokeMultiAttestations(CONTRACT_SCHEMA_ID, attestationIds)
}

function buildProjectMetadataAttestation({
  farcasterId,
  projectId,
  name,
  category,
  ipfsUrl,
}: {
  farcasterId: number
  projectId: string
  name: string
  category: string
  ipfsUrl: string
}) {
  const data = projectMetadataSchema.encodeData([
    { name: "projectRefUID", value: projectId, type: "bytes32" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "name", value: name, type: "string" },
    { name: "category", value: category, type: "string" },
    { name: "parentProjectRefUID", value: "", type: "bytes32" },
    { name: "metadataType", value: "0", type: "uint8" },
    { name: "metadataUrl", value: ipfsUrl, type: "string" },
  ])

  return {
    schema: PROJECT_METADATA_SCHEMA_ID,
    data,
    refUID: projectId,
  }
}

function buildContractAttestations({
  contracts,
  projectId,
  farcasterId,
}: {
  contracts: {
    contractAddress: string
    chainId: number
    deployer: string
    deploymentTx: string
    signature: string
    verificationChainId: number
  }[]
  projectId: string
  farcasterId: number
}) {
  const data = contracts.map((c) =>
    contractSchema.encodeData([
      { name: "contract", value: c.contractAddress, type: "address" },
      { name: "chainId", value: c.chainId, type: "uint8" },
      { name: "deployer", value: c.deployer, type: "address" },
      { name: "deploymentTx", value: c.deploymentTx, type: "bytes32" },
      { name: "signature", value: c.signature, type: "bytes" },
      {
        name: "verificationChainId",
        value: c.verificationChainId,
        type: "uint8",
      },
      { name: "farcasterID", value: farcasterId, type: "uint256" },
    ]),
  )

  return data.map((d) => ({
    schema: CONTRACT_SCHEMA_ID,
    data: d,
    refUID: projectId,
  }))
}
