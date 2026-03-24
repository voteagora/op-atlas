import { optimism, sepolia } from "viem/chains"

export type EasEnvironmentProfile = "dev" | "prod"

export const EAS_SCHEMA_STRINGS = {
  entity: "uint256 farcasterID,string type",
  projectMetadata:
    "bytes32 projectRefUID,uint256 farcasterID,string name,string category,bytes32 parentProjectRefUID,uint8 metadataType,string metadataUrl",
  organizationMetadata:
    "bytes32 refUID, uint256 farcasterID, string name, bytes32 parentOrgUID, bytes32[] projects, uint8 metadataType, string metadataUrl",
  application:
    "string round, uint256 farcasterID, bytes32 metadataSnapshotRefUID, uint8 metadataType, string metadataUrl",
  contract:
    "address contract, uint32 chainId, address deployer, bytes32 deploymentTx, bytes signature, uint32 verificationChainId, uint256 farcasterID",
  citizen: "uint256 farcasterId,string selectionMethod",
  citizenWalletChange: "bytes32 oldCitizenUID",
  votes: "uint256 proposalId,string params",
} as const

export const EAS_DEFAULT_SCHEMA_IDS: Record<
  EasEnvironmentProfile,
  {
    entity: string
    projectMetadata: string
    organizationMetadata: string
    application: string
    contract: string
    citizen: string
    citizenWalletChange: string
    votes: string
  }
> = {
  dev: {
    entity:
      "0x5eefb359bc596699202474fd99e92172d1b788aa34280f385c498875d1bfb424",
    projectMetadata:
      "0xe035e3fe27a64c8d7291ae54c6e85676addcbc2d179224fe7fc1f7f05a8c6eac",
    organizationMetadata:
      "0x9c181f1e683fd2d79287d0b4fe1832f571fb4f5815ff9c1d0ed5b7a9bd067a03",
    application:
      "0xb50a1973d1aab9206545cd1da93e0dc1b5314989928bb35f58762020e2027154",
    contract:
      "0xb4c6ea838744caa6f0bfce726c0223cffefb94d98e5690f818cf0e2800e7a8f2",
    citizen:
      "0x754160df7a4bd6ecf7e8801d54831a5d33403b4d52400e87d7611ee0eee6de23",
    citizenWalletChange:
      "0x3acfc8404d72c7112ef6f957f0fcf0a5c3e026b586c101ea25355d4666a00362",
    votes: "0xec3674d93b7007e918cf91ddd44bd14f28d138a4e7f3a79214dc35da2aed794e",
  },
  prod: {
    entity:
      "0xff0b916851c1c5507406cfcaa60e5d549c91b7f642eb74e33b88143cae4b47d0",
    projectMetadata:
      "0xe035e3fe27a64c8d7291ae54c6e85676addcbc2d179224fe7fc1f7f05a8c6eac",
    organizationMetadata:
      "0xc2b376d1a140287b1fa1519747baae1317cf37e0d27289b86f85aa7cebfd649f",
    application:
      "0x2169b74bfcb5d10a6616bbc8931dc1c56f8d1c305319a9eeca77623a991d4b80",
    contract:
      "0x5560b68760b2ec5a727e6a66e1f9754c307384fe7624ae4e0138c530db14a70b",
    citizen:
      "0xc35634c4ca8a54dce0a2af61a9a9a5a3067398cb3916b133238c4f6ba721bc8a",
    citizenWalletChange:
      "0xa55599e411f0eb310d47357e7d6064b09023e1d6f8bcb5504c051572a37db5f7",
    votes: "0xc113116804c90320b3d059ff8eed8b7171e3475f404f65828bbbe260dce15a99",
  },
}

export const EAS_DEFAULT_CONTRACT_ADDRESSES = {
  dev: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
  prod: "0x4200000000000000000000000000000000000021",
} as const

export const EAS_DEFAULT_CHAIN_IDS = {
  dev: sepolia.id,
  prod: optimism.id,
} as const

export const EAS_DEFAULT_NETWORKS = {
  dev: "sepolia",
  prod: "optimism",
} as const

export function getEasEnvironmentProfile(
  envValue = process.env.NEXT_PUBLIC_ENV,
): EasEnvironmentProfile {
  return envValue === "dev" ? "dev" : "prod"
}

export function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
