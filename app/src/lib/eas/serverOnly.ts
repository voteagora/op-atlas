import "server-only"

import {
  EAS,
  EIP712Response,
  SchemaEncoder,
  Signature,
} from "@ethereum-attestation-service/eas-sdk"
import { randomBytes } from "crypto"
import { ethers, Wallet } from "ethers"

import {
  EAS_DEFAULT_CHAIN_IDS,
  EAS_DEFAULT_CONTRACT_ADDRESSES,
  EAS_DEFAULT_NETWORKS,
  EAS_DEFAULT_SCHEMA_IDS,
  EAS_SCHEMA_STRINGS,
  getEasEnvironmentProfile,
  readOptionalEnv,
} from "@/lib/eas/schemaDefinitions"
import {
  extractEasTxInputData,
  extractFailedEasTxContext,
} from "@/lib/eas/txContext"
import { withImpersonationProtection } from "@/lib/impersonationContext"

const easEnvironment = getEasEnvironmentProfile()
const defaultSchemaIds = EAS_DEFAULT_SCHEMA_IDS[easEnvironment]

const readSchemaIdOverride = (
  serverEnvName: string,
  publicEnvName: string,
  fallback: string,
) =>
  readOptionalEnv(serverEnvName) ?? readOptionalEnv(publicEnvName) ?? fallback

const ENTITY_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_ENTITY_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_ENTITY_ID",
  defaultSchemaIds.entity,
)
const PROJECT_METADATA_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_PROJECT_METADATA_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_PROJECT_METADATA_ID",
  defaultSchemaIds.projectMetadata,
)
const ORGANIZATION_METADATA_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_ORGANIZATION_METADATA_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_ORGANIZATION_METADATA_ID",
  defaultSchemaIds.organizationMetadata,
)
const APPLICATION_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_APPLICATION_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_APPLICATION_ID",
  defaultSchemaIds.application,
)
const CONTRACT_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_CONTRACT_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_CONTRACT_ID",
  defaultSchemaIds.contract,
)
const CITIZEN_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_CITIZEN_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_CITIZEN_ID",
  defaultSchemaIds.citizen,
)
const CITIZEN_WALLET_CHANGE_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_CITIZEN_WALLET_CHANGE_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_CITIZEN_WALLET_CHANGE_ID",
  defaultSchemaIds.citizenWalletChange,
)
const OFFCHAIN_VOTE_SCHEMA_ID = readSchemaIdOverride(
  "EAS_SCHEMA_VOTES_ID",
  "NEXT_PUBLIC_EAS_SCHEMA_VOTES_ID",
  defaultSchemaIds.votes,
)

const citizenWalletChangeSchema = new SchemaEncoder(
  EAS_SCHEMA_STRINGS.citizenWalletChange,
)

const citizenSchema = new SchemaEncoder(EAS_SCHEMA_STRINGS.citizen)

const entitySchema = new SchemaEncoder(EAS_SCHEMA_STRINGS.entity)
const projectMetadataSchema = new SchemaEncoder(
  EAS_SCHEMA_STRINGS.projectMetadata,
)
const organizationMetadataSchema = new SchemaEncoder(
  EAS_SCHEMA_STRINGS.organizationMetadata,
)
const applicationSchema = new SchemaEncoder(EAS_SCHEMA_STRINGS.application)
const contractSchema = new SchemaEncoder(EAS_SCHEMA_STRINGS.contract)

const EAS_SIGNER_PRIVATE_KEY = process.env.EAS_SIGNER_PRIVATE_KEY
if (!EAS_SIGNER_PRIVATE_KEY) {
  throw new Error("EAS_SIGNER_PRIVATE_KEY is missing from env")
}

const EAS_ADDRESS =
  readOptionalEnv("EAS_CONTRACT_ADDRESS") ??
  readOptionalEnv("NEXT_PUBLIC_EAS_CONTRACT_ADDRESS") ??
  EAS_DEFAULT_CONTRACT_ADDRESSES[easEnvironment]

const eas = new EAS(EAS_ADDRESS)

const provider = new ethers.AlchemyProvider(
  EAS_DEFAULT_NETWORKS[easEnvironment],
  process.env.ALCHEMY_API_KEY,
)

const signer = new Wallet(EAS_SIGNER_PRIVATE_KEY, provider)

eas.connect(signer)

function mockUID(): string {
  return "0x" + randomBytes(32).toString("hex")
}

async function createAttestation(
  schemaId: string,
  data: string,
  refUID?: string,
) {
  const result = await createAttestationWithTx(schemaId, data, refUID)
  return result.attestationId
}

export type EasAttestationWithTxResult = {
  attestationId: string
  txHash?: string
  chainId: number
  txInputData?: string
}

async function createAttestationWithTx(
  schemaId: string,
  data: string,
  refUID?: string,
): Promise<EasAttestationWithTxResult> {
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
  const txInputData = extractEasTxInputData(tx)

  const attestationId = await tx.wait()

  return {
    attestationId,
    txHash: tx.receipt?.hash,
    chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
    txInputData,
  }
}

type EasMultiAttestationWithTxResult = {
  attestationIds: string[]
  txHashes: string[]
  txInputData: string[]
  chainId: number
}

async function createMultiAttestations(
  attestations: {
    schema: string
    data: string
    refUID?: string
  }[],
): Promise<string[]> {
  const result = await createMultiAttestationsWithTx(attestations)
  return result.attestationIds
}

async function createMultiAttestationsWithTx(
  attestations: {
    schema: string
    data: string
    refUID?: string
  }[],
): Promise<EasMultiAttestationWithTxResult> {
  const chainId = EAS_DEFAULT_CHAIN_IDS[easEnvironment]

  if (attestations.length === 0) {
    console.warn("No attestations to create")
    return {
      attestationIds: [],
      txHashes: [],
      txInputData: [],
      chainId,
    }
  }

  if (attestations.length === 1) {
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
      const txInputData = extractEasTxInputData(tx)
      const uid = await tx.wait()

      return {
        attestationIds: [uid],
        txHashes: tx.receipt?.hash ? [tx.receipt.hash] : [],
        txInputData: txInputData ? [txInputData] : [],
        chainId,
      }
    } catch (error) {
      console.error("Attestation failed", {
        attestation: a,
        error,
      })
      return {
        attestationIds: [],
        txHashes: [],
        txInputData: [],
        chainId,
      }
    }
  }

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

  for (const a of attestations) {
    if (!grouped.has(a.schema)) {
      grouped.set(a.schema, {
        schema: a.schema,
        data: [],
      })
    }

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
    const tx = await eas.multiAttest(attestationRequests)
    const txInputData = extractEasTxInputData(tx)
    const attestationIds = await tx.wait()

    return {
      attestationIds,
      txHashes: tx.receipt?.hash ? [tx.receipt.hash] : [],
      txInputData: txInputData ? [txInputData] : [],
      chainId,
    }
  } catch (error) {
    console.warn("multiAttest failed, splitting batch:", {
      size: attestations.length,
    })

    const mid = Math.floor(attestations.length / 2)
    const left = attestations.slice(0, mid)
    const right = attestations.slice(mid)

    const leftResult = await createMultiAttestationsWithTx(left)
    const rightResult = await createMultiAttestationsWithTx(right)

    return {
      attestationIds: leftResult.attestationIds.concat(
        rightResult.attestationIds,
      ),
      txHashes: leftResult.txHashes.concat(rightResult.txHashes),
      txInputData: leftResult.txInputData.concat(rightResult.txInputData),
      chainId,
    }
  }
}

async function revokeMultiAttestations(
  schemaId: string,
  attestationIds: string[],
) {
  const result = await revokeMultiAttestationsWithTx(schemaId, attestationIds)
  return result.revokedAttestationIds
}

type EasRevocationWithTxResult = {
  revokedAttestationIds: string[]
  txHash?: string
  chainId: number
  txInputData?: string
}

async function revokeMultiAttestationsWithTx(
  schemaId: string,
  attestationIds: string[],
): Promise<EasRevocationWithTxResult> {
  const tx = await eas.multiRevoke([
    {
      schema: schemaId,
      data: attestationIds.map((id) => ({ uid: id })),
    },
  ])
  const txInputData = extractEasTxInputData(tx)

  await tx.wait()

  return {
    revokedAttestationIds: attestationIds,
    txHash: tx.receipt?.hash,
    chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
    txInputData,
  }
}

export async function createEntityAttestation({
  farcasterId,
  type,
}: {
  farcasterId: number
  type: "project" | "organization"
}) {
  return withImpersonationProtection(
    "EAS",
    `Create entity attestation (${type})`,
    async () => {
      const data = entitySchema.encodeData([
        { name: "farcasterID", value: farcasterId, type: "uint256" },
        { name: "type", value: type, type: "string" },
      ])

      const attestationId = await createAttestation(ENTITY_SCHEMA_ID, data)
      console.info("Created entity attestation:", attestationId)

      return attestationId
    },
    mockUID(),
  )
}

export async function createEntityAttestationWithTx({
  farcasterId,
  type,
}: {
  farcasterId: number
  type: "project" | "organization"
}): Promise<EasAttestationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Create entity attestation (${type})`,
    async () => {
      const data = entitySchema.encodeData([
        { name: "farcasterID", value: farcasterId, type: "uint256" },
        { name: "type", value: type, type: "string" },
      ])

      const result = await createAttestationWithTx(ENTITY_SCHEMA_ID, data)
      console.info("Created entity attestation:", result.attestationId)

      return result
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
}

export async function createProjectMetadataAttestation({
  farcasterId,
  projectId,
  name,
  category,
  ipfsUrl,
  refUID,
}: {
  farcasterId: number
  projectId: string
  name: string
  category: string
  ipfsUrl: string
  refUID?: string
}) {
  return withImpersonationProtection(
    "EAS",
    `Create project metadata attestation (${projectId})`,
    async () => {
      const attestation = buildProjectMetadataAttestation({
        farcasterId,
        projectId,
        name,
        category,
        ipfsUrl,
        refUID,
      })

      const attestationId = await createAttestation(
        attestation.schema,
        attestation.data,
        attestation.refUID,
      )

      console.info("Created project metadata attestation:", attestationId)

      return attestationId
    },
    mockUID(),
  )
}

export async function createProjectMetadataAttestationWithTx({
  farcasterId,
  projectId,
  name,
  category,
  ipfsUrl,
  refUID,
}: {
  farcasterId: number
  projectId: string
  name: string
  category: string
  ipfsUrl: string
  refUID?: string
}): Promise<EasAttestationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Create project metadata attestation (${projectId})`,
    async () => {
      const attestation = buildProjectMetadataAttestation({
        farcasterId,
        projectId,
        name,
        category,
        ipfsUrl,
        refUID,
      })

      const result = await createAttestationWithTx(
        attestation.schema,
        attestation.data,
        attestation.refUID,
      )

      console.info(
        "Created project metadata attestation:",
        result.attestationId,
      )

      return result
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
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
  return withImpersonationProtection(
    "EAS",
    `Create organization metadata attestation (${organizationId})`,
    async () => {
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
    },
    mockUID(),
  )
}

export async function createOrganizationMetadataAttestationWithTx({
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
}): Promise<EasAttestationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Create organization metadata attestation (${organizationId})`,
    async () => {
      const data = organizationMetadataSchema.encodeData([
        { name: "refUID", value: organizationId, type: "bytes32" },
        { name: "farcasterID", value: farcasterId, type: "uint256" },
        { name: "name", value: name, type: "string" },
        { name: "parentOrgUID", value: "", type: "bytes32" },
        { name: "projects", value: projectIds, type: "bytes32[]" },
        { name: "metadataType", value: "0", type: "uint8" },
        { name: "metadataUrl", value: ipfsUrl, type: "string" },
      ])

      const result = await createAttestationWithTx(
        ORGANIZATION_METADATA_SCHEMA_ID,
        data,
        organizationId,
      )

      console.info(
        "Created organization metadata attestation:",
        result.attestationId,
      )

      return result
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
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
  return withImpersonationProtection(
    "EAS",
    `Create application attestation (${projectId})`,
    async () => {
      const data = applicationSchema.encodeData([
        { name: "round", value: round, type: "string" },
        { name: "farcasterID", value: farcasterId, type: "uint256" },
        { name: "metadataSnapshotRefUID", value: snapshotRef, type: "bytes32" },
        { name: "metadataType", value: "0", type: "uint8" },
        { name: "metadataUrl", value: ipfsUrl, type: "string" },
      ])

      return await createAttestation(APPLICATION_SCHEMA_ID, data, projectId)
    },
    mockUID(),
  )
}

export async function createApplicationAttestationWithTx({
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
}): Promise<EasAttestationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Create application attestation (${projectId})`,
    async () => {
      const data = applicationSchema.encodeData([
        { name: "round", value: round, type: "string" },
        { name: "farcasterID", value: farcasterId, type: "uint256" },
        { name: "metadataSnapshotRefUID", value: snapshotRef, type: "bytes32" },
        { name: "metadataType", value: "0", type: "uint8" },
        { name: "metadataUrl", value: ipfsUrl, type: "string" },
      ])

      return await createAttestationWithTx(
        APPLICATION_SCHEMA_ID,
        data,
        projectId,
      )
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
}

export async function createContractAttestations({
  contracts,
  projectId,
  farcasterId,
  refUID,
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
  refUID?: string
}) {
  return withImpersonationProtection(
    "EAS",
    `Create ${contracts.length} contract attestations for ${projectId}`,
    async () => {
      const attestations = buildContractAttestations({
        contracts,
        projectId,
        farcasterId,
        refUID,
      })

      return await processAttestationsInBatches(
        attestations,
        createMultiAttestations,
        60,
      )
    },
    contracts.map(() => mockUID()),
  )
}

export async function createContractAttestationsWithTx({
  contracts,
  projectId,
  farcasterId,
  refUID,
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
  refUID?: string
}): Promise<{
  attestationIds: string[]
  txHashes: string[]
  txInputData: string[]
  chainId: number
}> {
  return withImpersonationProtection(
    "EAS",
    `Create ${contracts.length} contract attestations for ${projectId}`,
    async () => {
      const attestations = buildContractAttestations({
        contracts,
        projectId,
        farcasterId,
        refUID,
      })

      const batchSize = 60
      const maxRetries = 5
      const combined = {
        attestationIds: [] as string[],
        txHashes: [] as string[],
        txInputData: [] as string[],
        chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      }

      function* batchGenerator<T>(items: T[], size: number) {
        for (let i = 0; i < items.length; i += size) {
          yield items.slice(i, i + size)
        }
      }

      async function processBatchWithRetry(
        batch: typeof attestations,
        retryCount = 0,
      ): Promise<EasMultiAttestationWithTxResult> {
        try {
          return await createMultiAttestationsWithTx(batch)
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

      for await (const batch of batchGenerator(attestations, batchSize)) {
        const result = await processBatchWithRetry(batch)
        combined.attestationIds.push(...result.attestationIds)
        combined.txHashes.push(...result.txHashes)
        combined.txInputData.push(...result.txInputData)
      }

      return combined
    },
    {
      attestationIds: contracts.map(() => mockUID()),
      txHashes: [],
      txInputData: [],
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
    },
  )
}

export async function createCitizenWalletChangeAttestation({
  oldCitizenUID,
  newCitizenUID,
}: {
  oldCitizenUID: string
  newCitizenUID: string
}) {
  const result = await createCitizenWalletChangeAttestationWithTx({
    oldCitizenUID,
    newCitizenUID,
  })
  return result.attestationId
}

export async function createCitizenWalletChangeAttestationWithTx({
  oldCitizenUID,
  newCitizenUID,
}: {
  oldCitizenUID: string
  newCitizenUID: string
}): Promise<EasAttestationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Create citizen wallet change attestation`,
    async () => {
      const data = citizenWalletChangeSchema.encodeData([
        { name: "oldCitizenUID", value: oldCitizenUID, type: "bytes32" },
      ])

      return await createAttestationWithTx(
        CITIZEN_WALLET_CHANGE_SCHEMA_ID,
        data,
        newCitizenUID,
      )
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
}

export async function revokeContractAttestations(attestationIds: string[]) {
  if (attestationIds.length === 0) {
    return
  }
  return withImpersonationProtection(
    "EAS",
    `Revoke ${attestationIds.length} contract attestations`,
    async () =>
      processAttestationsInBatches(
        attestationIds,
        async (batch) => revokeMultiAttestations(CONTRACT_SCHEMA_ID, batch),
        20,
      ),
    [],
  )
}

export async function revokeCitizenAttestation(attestationId: string) {
  const result = await revokeCitizenAttestationWithTx(attestationId)
  return result.revokedAttestationIds
}

export async function revokeCitizenAttestationWithTx(
  attestationId: string,
): Promise<EasRevocationWithTxResult> {
  return withImpersonationProtection(
    "EAS",
    `Revoke citizen attestation`,
    async () => {
      const isActive = await isAttestationActive(attestationId)
      if (!isActive) {
        return {
          revokedAttestationIds: [],
          txHash: undefined,
          chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
          txInputData: undefined,
        }
      }

      return revokeMultiAttestationsWithTx(CITIZEN_SCHEMA_ID, [attestationId])
    },
    {
      revokedAttestationIds: [],
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
}

function buildProjectMetadataAttestation({
  farcasterId,
  projectId,
  name,
  category,
  ipfsUrl,
  refUID,
}: {
  farcasterId: number
  projectId: string
  name: string
  category: string
  ipfsUrl: string
  refUID?: string
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
    refUID: refUID ?? projectId,
  }
}

function buildContractAttestations({
  contracts,
  projectId,
  farcasterId,
  refUID,
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
  refUID?: string
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

  const resolvedRefUID = resolveContractRefUID(projectId, refUID)

  return data.map((d) => ({
    schema: CONTRACT_SCHEMA_ID,
    data: d,
    refUID: resolvedRefUID,
  }))
}

function parseZeroSignature(signature: string) {
  if (signature === "0x0" || signature === "") {
    return "0x"
  }
  return signature
}

function resolveContractRefUID(projectId: string, refUID?: string) {
  if (!refUID) {
    throw new Error(
      `Missing project metadata attestation reference UID for project ${projectId}`,
    )
  }
  return refUID
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
  const result = await createCitizenAttestationWithTx({
    to,
    farcasterId,
    selectionMethod,
    refUID,
  })

  return result.attestationId
}

export async function createCitizenAttestationWithTx({
  to,
  farcasterId,
  selectionMethod,
  refUID,
}: {
  to: string
  farcasterId: number
  selectionMethod: string
  refUID?: string
}): Promise<{
  attestationId: string
  txHash?: string
  chainId: number
  txInputData?: string
}> {
  return withImpersonationProtection(
    "EAS",
    `Create citizen attestation`,
    async () => {
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
      const txInputData = extractEasTxInputData(tx)

      const attestationId = await tx.wait()

      return {
        attestationId,
        txHash: tx.receipt?.hash,
        chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
        txInputData,
      }
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
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
  const result = await createDelegatedVoteAttestationWithTx(
    data,
    delegateAttestationSignature,
    signerAddress,
    citizenRefUID,
  )

  return result.attestationId
}

export async function createDelegatedVoteAttestationWithTx(
  data: string,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
): Promise<{
  attestationId: string
  txHash?: string
  chainId: number
  txInputData?: string
}> {
  return withImpersonationProtection(
    "EAS",
    `Create delegated vote attestation`,
    async () => {
      console.log("createDelegatedVoteAttestation: ", {
        data,
        delegateAttestationSignature,
        signerAddress,
        citizenRefUID,
      })

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
      const txInputData = extractEasTxInputData(tx)

      try {
        // Wait for the transaction to be mined
        const attestationId = await tx.wait()
        console.log("Vote attestation created with ID:", attestationId)
        return {
          attestationId,
          txHash: tx.receipt?.hash,
          chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
          txInputData,
        }
      } catch (error) {
        const failedContext = extractFailedEasTxContext(error)
        const wrappedError = new Error(
          "Delegated vote attestation transaction reverted.",
        ) as Error & {
          txHash?: string
          chainId?: number
          txInputData?: string
          cause?: unknown
        }
        wrappedError.txHash = failedContext.txHash ?? tx.receipt?.hash
        wrappedError.chainId =
          failedContext.chainId ?? EAS_DEFAULT_CHAIN_IDS[easEnvironment]
        wrappedError.txInputData = failedContext.txInputData ?? txInputData
        wrappedError.cause = error
        console.error("Error creating vote attestation:", wrappedError)
        throw wrappedError
      }
    },
    {
      attestationId: mockUID(),
      txHash: undefined,
      chainId: EAS_DEFAULT_CHAIN_IDS[easEnvironment],
      txInputData: undefined,
    },
  )
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
