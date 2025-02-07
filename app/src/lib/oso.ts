import { OsoDeployerContractsReturnType } from "@/lib/types"
import { gql, GraphQLClient } from "graphql-request"

const SUBGRAPH_URL = "https://www.opensource.observer/api/v1/graphql"

const client = new GraphQLClient(SUBGRAPH_URL, {
  headers: {
    Authorization: `Bearer ${"XMT6GzRP1q7lk4KuiV3950B/IOC64jo_"}`,
  },
})

export async function getDeployedContracts(
  deployer: string,
): Promise<OsoDeployerContractsReturnType> {
  const variables = {
    where: {
      // Example where filter; replace with your actual filter conditions
      rootDeployerAddress: { _eq: deployer },
    },
  }

  const query = gql`
    query ExampleQuery($where: Oso_ContractsV0BoolExp) {
      oso_contractsV0(where: $where) {
        artifactSource
        contractAddress
        rootDeployerAddress
      }
    }
  `
  const req: OsoDeployerContractsReturnType = await client.request(
    query,
    variables,
  )

  return req
}
