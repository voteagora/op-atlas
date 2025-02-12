import { gql } from "graphql-request"
import { NextResponse } from "next/server"

import { osoClient } from "@/app/api/oso/common"
import { OsoDeployerContractsReturnType } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params

  const contracts = await getDeployedContracts(address)

  return NextResponse.json(contracts)
}

async function getDeployedContracts(
  deployer: string,
): Promise<OsoDeployerContractsReturnType> {
  const variables = {
    where: {
      rootDeployerAddress: { _ilike: deployer },
    },
  }

  const query = gql`
    query ContractQuery($where: Oso_ContractsV0BoolExp) {
      oso_contractsV0(where: $where) {
        contractAddress
        contractNamespace
        rootDeployerAddress
      }
    }
  `
  const req: OsoDeployerContractsReturnType = await osoClient.request(
    query,
    variables,
  )

  return req
}
