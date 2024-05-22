import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { ethers, Wallet } from "ethers"

const PROJECT_SCHEMA_ID =
  "0x7ae9f4adabd9214049df72f58eceffc48c4a69e920882f5b06a6c69a3157e5bd"
const METADATA_SCHEMA_ID =
  "0xe035e3fe27a64c8d7291ae54c6e85676addcbc2d179224fe7fc1f7f05a8c6eac"
const APPLICATION_SCHEMA_ID =
  "0x88b62595c76fbcd261710d0930b5f1cc2e56758e155dea537f82bf0baadd9a32"

const projectSchema = new SchemaEncoder("uint256 farcasterID,string issuer")
const metadataSchema = new SchemaEncoder(
  "bytes32 projectRefUID,uint256 farcasterID,string name,string category,bytes32 parentProjectRefUID,uint8 metadataType,string metadataUrl",
)
const applicationSchema = new SchemaEncoder(
  "uint32 round,bytes32 projectRefUID,uint256 farcasterID,bytes32 metadataSnapshotRefUID",
)

const EAS_SIGNER_PRIVATE_KEY = process.env.EAS_SIGNER_PRIVATE_KEY
if (!EAS_SIGNER_PRIVATE_KEY) {
  throw new Error("EAS_SIGNER_PRIVATE_KEY is missing from env")
}

// Optimism address
const eas = new EAS("0x4200000000000000000000000000000000000021")

const provider = new ethers.AlchemyProvider(
  "optimism",
  process.env.ALCHEMY_API_KEY,
)

const signer = new Wallet(EAS_SIGNER_PRIVATE_KEY, provider)

eas.connect(signer)

async function createAttestation(schemaId: string, data: string) {
  const tx = await eas.attest({
    schema: schemaId,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: true,
      data,
    },
  })

  return await tx.wait()
}

export async function createProjectAttestation({
  farcasterId,
}: {
  farcasterId: number
}) {
  const data = projectSchema.encodeData([
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "issuer", value: "OP Atlas", type: "string" },
  ])

  const attestationId = await createAttestation(PROJECT_SCHEMA_ID, data)
  console.info("Created project attestation:", attestationId)

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
  const data = metadataSchema.encodeData([
    { name: "projectRefUID", value: projectId, type: "bytes32" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "name", value: name, type: "string" },
    { name: "category", value: category, type: "string" },
    { name: "parentProjectRefUID", value: "", type: "bytes32" },
    { name: "metadataType", value: "0", type: "uint8" },
    { name: "metadataUrl", value: ipfsUrl, type: "string" },
  ])

  const attestationId = await createAttestation(METADATA_SCHEMA_ID, data)
  console.info("Created project metadata attestation:", attestationId)

  return attestationId
}

export async function createApplicationAttestation({
  farcasterId,
  projectId,
  round,
  snapshotRef,
}: {
  farcasterId: number
  projectId: string
  round: number
  snapshotRef: string
}) {
  const data = applicationSchema.encodeData([
    { name: "round", value: round, type: "uint32" },
    { name: "projectRefUID", value: projectId, type: "bytes32" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "metadataSnapshotRefUID", value: snapshotRef, type: "bytes32" },
  ])

  const attestationId = await createAttestation(APPLICATION_SCHEMA_ID, data)
  console.info("Created application attestation:", attestationId)

  return attestationId
}
