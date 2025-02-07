import { ProjectContract } from "@prisma/client"

export type DBContract = { address: string; chainId: number }

export type DBData = {
  deployerAddress: string
  contracts: DBContract[]
}

export type OSOContract = {
  address: string
  chain: string
}

export type OSOData = {
  address: string
  contracts: OSOContract[]
}

export const mockProjectContractsData = [
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    chainId: 8453,
  },
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chainId: 34443,
  },
  {
    deployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contractAddress: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
    chainId: 34443,
  },
] as Array<ProjectContract>

export type OsoDeployerContracts = {
  artifactSource: string
  contractAddress: string
  rootDeployerAddress: string
}

export type OsoDeployerContractsReturnType = {
  osoContractsV0: Array<OsoDeployerContracts>
}

export const mockOsoDeployerContractsData: OsoDeployerContractsReturnType = {
  osoContractsV0: [],
}

export const mockBackendOSOData = [
  {
    address: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contracts: [
      {
        address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
        chain: "8453",
      },
      {
        address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
        chain: "34443",
      },
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
    ],
  },
  {
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contracts: [
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
    ],
  },
  {
    address: "0x05E4eBb06B3a4dB3138e68FeDEa0Daa106b111E8",
    contracts: [
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
      {
        address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
        chain: "34443",
      },
    ],
  },
] as Array<OSOData>
