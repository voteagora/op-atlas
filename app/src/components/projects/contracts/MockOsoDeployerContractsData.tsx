import { OsoDeployerContractsReturnType } from "@/lib/types"

export const mockOsoDeployerContractsData: OsoDeployerContractsReturnType = {
  oso_contractsV0: [
    {
      artifactSource: "OPTIMISM",
      contractAddress: "0xb4f7820e76d591e60f0b03cab5232e03376061a2",
      rootDeployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    },
    {
      artifactSource: "BASE",
      contractAddress: "0xae7efef5d13279c78e821fecc67e625e5eee242a",
      rootDeployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    },
  ],
}

export const mockOsoDeployersContractsData: OsoDeployerContractsReturnType[] = [
  mockOsoDeployerContractsData,
  {
    oso_contractsV0: [
      {
        artifactSource: "MODE",
        contractAddress: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        rootDeployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
      },
    ],
  },
  { oso_contractsV0: [] },
]
