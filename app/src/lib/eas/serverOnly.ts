"use server"

import {
  EAS,
  EIP712Response,
  SchemaEncoder,
  Signature,
} from "@ethereum-attestation-service/eas-sdk"
import { ethers, Wallet } from "ethers"

import {
  EAS_CONTRACT_ADDRESS,
  OFFCHAIN_VOTE_SCHEMA_ID,
} from "@/lib/eas/clientSafe"

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
    ? "0xb4c6ea838744caa6f0bfce726c0223cffefb94d98e5690f818cf0e2800e7a8f2"
    : "0x5560b68760b2ec5a727e6a66e1f9754c307384fe7624ae4e0138c530db14a70b"

const CITIZEN_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0x754160df7a4bd6ecf7e8801d54831a5d33403b4d52400e87d7611ee0eee6de23"
    : "0xc35634c4ca8a54dce0a2af61a9a9a5a3067398cb3916b133238c4f6ba721bc8a"
const CITIZEN_WALLET_CHANGE_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0x3acfc8404d72c7112ef6f957f0fcf0a5c3e026b586c101ea25355d4666a00362"
    : "0xa55599e411f0eb310d47357e7d6064b09023e1d6f8bcb5504c051572a37db5f7"

const citizenWalletChangeSchema = new SchemaEncoder("bytes32 oldCitizenUID")

const citizenSchema = new SchemaEncoder(
  "uint256 farcasterId,string selectionMethod",
)

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
  "address contract, uint32 chainId, address deployer, bytes32 deploymentTx, bytes signature, uint32 verificationChainId, uint256 farcasterID",
)

const EAS_SIGNER_PRIVATE_KEY = process.env.EAS_SIGNER_PRIVATE_KEY
if (!EAS_SIGNER_PRIVATE_KEY) {
  throw new Error("EAS_SIGNER_PRIVATE_KEY is missing from env")
}

const eas = new EAS(EAS_CONTRACT_ADDRESS)

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
): Promise<string[]> {
  if (attestations.length === 0) {
    console.warn("No attestations to create")
    return []
  }
  if (attestations.length === 1) {
    // Single-attest fallback
    const [a] = attestations
    try {
      const tx = await eas.attest({
        schema: a.schema,
        data: {
          recipient: "0x0000000000000000000000000000000000000000",
          expirationTime: BigInt(0),
          revocable: true,
          data: a.data,
          refUID: a.refUID,
        },
      })
      const uid = await tx.wait()
      return [uid]
    } catch (error) {
      console.error("Attestation failed", {
        attestation: a,
        error: error,
      })
      return []
    }
  }

  // Group by schema to reduce calldata and improve gas efficiency
  const grouped = new Map<
    string,
    {
      schema: string
      data: {
        recipient: string
        expirationTime: bigint
        revocable: boolean
        data: string
        refUID?: string
      }[]
    }
  >()

  // For each unique schema value, it checks if grouped already has a bucket.
  for (const a of attestations) {
    // if not, create a new bucket
    if (!grouped.has(a.schema)) {
      grouped.set(a.schema, {
        schema: a.schema,
        data: [],
      })
    }
    // Add the attestation to the bucket
    grouped.get(a.schema)!.data.push({
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: true,
      data: a.data,
      refUID: a.refUID,
    })
  }

  const attestationRequests = Array.from(grouped.values())

  try {
    // Try to submit as one batched multiAttest call
    const tx = await eas.multiAttest(attestationRequests)
    return await tx.wait()
  } catch (error) {
    // If it fails (gas/size/other constraint), split the input in half and recurse.
    console.warn("multiAttest failed, splitting batch:", {
      size: attestations.length,
    })

    const mid = Math.floor(attestations.length / 2)
    const left = attestations.slice(0, mid)
    const right = attestations.slice(mid)

    // Recurse sequentially to avoid nonce/race issues
    const leftUids = await createMultiAttestations(left)
    const rightUids = await createMultiAttestations(right)

    return leftUids.concat(rightUids)
  }
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

  await tx.wait()

  return attestationIds
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

  return await createAttestation(APPLICATION_SCHEMA_ID, data, projectId)
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

  return await createMultiAttestations(attestations)
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

  return processAttestationsInBatches(attestations, createMultiAttestations)
}

export async function createCitizenWalletChangeAttestation({
  oldCitizenUID,
  newCitizenUID,
}: {
  oldCitizenUID: string
  newCitizenUID: string
}) {
  const data = citizenWalletChangeSchema.encodeData([
    { name: "oldCitizenUID", value: oldCitizenUID, type: "bytes32" },
  ])

  return await createAttestation(
    CITIZEN_WALLET_CHANGE_SCHEMA_ID,
    data,
    newCitizenUID,
  )
}

export async function revokeContractAttestations(attestationIds: string[]) {
  if (attestationIds.length === 0) {
    return
  }

  return processAttestationsInBatches(
    attestationIds,
    async (batch) => revokeMultiAttestations(CONTRACT_SCHEMA_ID, batch),
    20,
  )
}

export async function revokeCitizenAttestation(attestationId: string) {
  const isActive = await isAttestationActive(attestationId)
  if (!isActive) {
    return
  }

  return processAttestationsInBatches(
    [attestationId],
    async (batch) => revokeMultiAttestations(CITIZEN_SCHEMA_ID, batch),
    20,
  )
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
      { name: "chainId", value: c.chainId, type: "uint32" },
      { name: "deployer", value: c.deployer, type: "address" },
      { name: "deploymentTx", value: c.deploymentTx, type: "bytes32" },
      {
        name: "signature",
        value: parseZeroSignature(c.signature),
        type: "bytes",
      },
      {
        name: "verificationChainId",
        value: c.verificationChainId,
        type: "uint32",
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

function parseZeroSignature(signature: string) {
  if (signature === "0x0" || signature === "") {
    return "0x"
  }
  return signature
}

export async function processAttestationsInBatches<T>(
  attestations: T[],
  processFn: (batch: T[]) => Promise<string[]>,
  batchSize = 50,
  maxRetries = 5,
): Promise<string[]> {
  function* batchGenerator<T>(items: T[], size: number) {
    for (let i = 0; i < items.length; i += size) {
      yield items.slice(i, i + size)
    }
  }

  async function processBatchWithRetry(
    batch: T[],
    retryCount = 0,
  ): Promise<string[]> {
    try {
      return await processFn(batch)
    } catch (error) {
      if (retryCount >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries: ${error}`)
      }
      console.warn(
        `Retry ${retryCount + 1}/${maxRetries} for batch of ${
          batch.length
        } items`,
      )
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000),
      )
      return processBatchWithRetry(batch, retryCount + 1)
    }
  }

  const allResults = []
  for await (const batch of batchGenerator(attestations, batchSize)) {
    const batchResults = await processBatchWithRetry(batch)
    allResults.push(...batchResults)
  }

  return allResults
}

export async function createCitizenAttestation({
  to,
  farcasterId,
  selectionMethod,
  refUID,
}: {
  to: string
  farcasterId: number
  selectionMethod: string
  refUID?: string
}) {
  const data = citizenSchema.encodeData([
    { name: "farcasterId", value: farcasterId, type: "uint256" },
    { name: "selectionMethod", value: selectionMethod, type: "string" },
  ])

  const tx = await eas.attest({
    schema: CITIZEN_SCHEMA_ID,
    data: {
      recipient: to,
      expirationTime: BigInt(0),
      revocable: true,
      data,
      refUID,
    },
  })

  return await tx.wait()
}

export async function isAttestationActive(
  attestationId: string,
): Promise<boolean> {
  try {
    const attestation = await eas.getAttestation(attestationId)
    return attestation !== null && !attestation.revocationTime
  } catch (error) {
    console.warn("Error checking attestation status:", error)
    return false
  }
}

export async function createDelegatedVoteAttestation(
  data: string,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
): Promise<string> {
  console.log("createDelegatedVoteAttestation: ", {
    data,
    delegateAttestationSignature,
    signerAddress,
    citizenRefUID,
  })

  try {
    // Use attestByDelegation to create the attestation
    const tx = await eas.attestByDelegation({
      schema: OFFCHAIN_VOTE_SCHEMA_ID,
      data: {
        recipient: signerAddress,
        expirationTime: BigInt(0), // NO_EXPIRATION
        revocable: false,
        refUID: citizenRefUID as `0x${string}`,
        data: data,
      },
      signature: delegateAttestationSignature,
      attester: signerAddress,
      deadline: BigInt(0), // NO_EXPIRATION
    })

    // Wait for the transaction to be mined
    const receipt = await tx.wait()
    console.log("Vote attestation created with ID:", receipt)
    return receipt
  } catch (error) {
    console.error("Error creating vote attestation:", error)
    throw error
  }
}

export const validateSignatureAddressIsValid = async (
  response: EIP712Response<any, any>,
  expectedSignerAddress: string,
): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.verifyTypedData(
      response.domain,
      response.types,
      response.message,
      response.signature,
    )

    return (
      recoveredAddress.toLowerCase() === expectedSignerAddress.toLowerCase()
    )
  } catch (error) {
    console.error("EIP712 validation error:", error)
    return false
  }
}
