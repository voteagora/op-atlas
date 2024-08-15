import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { ethers, Wallet } from "ethers"

const ENTITY_SCHEMA_ID =
  "0x4222d050383fadf18ce0ccd8f37a569a655c05e07d6bdc638c1472da01842ef8"
const PROJECT_METADATA_SCHEMA_ID =
  "0xe035e3fe27a64c8d7291ae54c6e85676addcbc2d179224fe7fc1f7f05a8c6eac"
const ORGANIZATION_METADATA_SCHEMA_ID =
  "0x9039564787fb32c75c224c977ba9f4c4af53fa0a6e917cb6c0eb6f4a6eaf2055"
const APPLICATION_SCHEMA_ID =
  "0x88b62595c76fbcd261710d0930b5f1cc2e56758e155dea537f82bf0baadd9a32"

const entitySchema = new SchemaEncoder("uint256 farcasterID,string type")
const projectMetadataSchema = new SchemaEncoder(
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
  const data = entitySchema.encodeData([
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "type", value: "project", type: "string" },
  ])

  const attestationId = await createAttestation(ENTITY_SCHEMA_ID, data)
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
  const data = projectMetadataSchema.encodeData([
    { name: "projectRefUID", value: projectId, type: "bytes32" },
    { name: "farcasterID", value: farcasterId, type: "uint256" },
    { name: "name", value: name, type: "string" },
    { name: "category", value: category, type: "string" },
    { name: "parentProjectRefUID", value: "", type: "bytes32" },
    { name: "metadataType", value: "0", type: "uint8" },
    { name: "metadataUrl", value: ipfsUrl, type: "string" },
  ])

  const attestationId = await createAttestation(
    PROJECT_METADATA_SCHEMA_ID,
    data,
  )
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
