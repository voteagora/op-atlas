import { OsoDeployerContractsReturnType } from "@/lib/types"

export const mockOsoDeployerContractsData: OsoDeployerContractsReturnType = {
  osoContractsV0: [
    {
      artifactSource: "OPTIMISM",
      contractAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
      rootDeployerAddress: "8453",
    },
  ],
}

export const mockOsoDeployersContractsData: OsoDeployerContractsReturnType[] = [
  mockOsoDeployerContractsData,
]
