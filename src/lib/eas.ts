import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { ethers, Wallet } from "ethers"

const PROJECT_SCHEMA_ID =
  "0x0e5d439a46d50507c63ea277b75c4d87711cc9d1754103393066927ee9be9fe3"
const METADATA_SCHEMA_ID =
  "0x9a384502b07bb8dfe65a784d0abee1dc22ff541024a9965d78ef7934dda7b6ca"
const APPLICATION_SCHEMA_ID =
  "0x5a2187bc9d5f9a35b18538f30614ea92fc31c7f704707161de395f2ce6c09cab"

const projectSchema = new SchemaEncoder("uint256 farcasterID")
const metadataSchema = new SchemaEncoder(
  "bytes32 projectRefUID,string name,string category,bytes32 parentProjectRefUID,uint8 metadataType,string metadataUrl",
)
const applicationSchema = new SchemaEncoder(
  "uint8 round,bytes32 projectRefUID,bytes32 metadataSnapshotRefUID",
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
  farcasterId: string
}) {
  const data = projectSchema.encodeData([
    { name: "farcasterID", value: farcasterId, type: "uint256" },
  ])

  const attestationId = await createAttestation(PROJECT_SCHEMA_ID, data)
  console.info("Created project attestation:", attestationId)

  return attestationId
}

export async function createProjectMetadataAttestation({
  projectId,
  name,
  category,
  ipfsUrl,
}: {
  projectId: string
  name: string
  category: string
  ipfsUrl: string
}) {
  const data = metadataSchema.encodeData([
    { name: "projectRefUID", value: projectId, type: "bytes32" },
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
  projectId,
  round,
  snapshotRef,
}: {
  projectId: string
  round: number
  snapshotRef: string
}) {
  const data = applicationSchema.encodeData([
    { name: "round", value: round, type: "uint8" },
    { name: "projectRefUID", value: projectId, type: "bytes32" },
    { name: "metadataSnapshotRefUID", value: snapshotRef, type: "bytes32" },
  ])

  const attestationId = await createAttestation(APPLICATION_SCHEMA_ID, data)
  console.info("Created application attestation:", attestationId)

  return attestationId
}
