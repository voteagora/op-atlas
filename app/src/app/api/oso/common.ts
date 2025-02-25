import { gql, GraphQLClient } from "graphql-request"

import { parseOsoDeployerContract } from "@/lib/oso"
import {
  OsoDeployerContractsReturnType,
  ParsedOsoDeployerContract,
} from "@/lib/types"

export const osoClient = new GraphQLClient(
  "https://www.opensource.observer/api/v1/graphql",
  {
    headers: {
      Authorization: `Bearer ${process.env.OSO_AUTH_TOKEN}`,
    },
  },
)

export async function getDeployedContractsServer(
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

export async function getDeployedContractsServerParsed(
  deployer: string,
): Promise<ParsedOsoDeployerContract[]> {
  const contracts = await getDeployedContractsServer(deployer)
  return parseOsoDeployerContract(contracts)
}
