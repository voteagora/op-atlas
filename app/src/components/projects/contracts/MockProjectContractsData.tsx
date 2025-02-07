import { ProjectContract } from "@prisma/client"

export const mockProjectContractsData = [
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xb4f7820e76d591e60f0b03cab5232e03376061a2",
    chainId: 10,
  },
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chainId: 8453,
  },
  {
    deployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contractAddress: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
    chainId: 34443,
  },
] as Array<ProjectContract>
