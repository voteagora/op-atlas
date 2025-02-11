import { OsoDeployerContractsReturnType } from "@/lib/types"
import { gql, GraphQLClient } from "graphql-request"

if (!process.env.NEXT_PUBLIC_OSO_AUTH_TOKEN) {
  throw new Error("OSO_AUTH_TOKEN is missing from env")
}

const SUBGRAPH_URL = "https://www.opensource.observer/api/v1/graphql"

const client = new GraphQLClient(SUBGRAPH_URL, {
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_OSO_AUTH_TOKEN}`,
  },
})

export async function getDeployedContracts(
  deployer: string,
): Promise<OsoDeployerContractsReturnType> {
  const variables = {
    where: {
      // Example where filter; replace with your actual filter conditions
      rootDeployerAddress: { _ilike: deployer },
    },
  }

  const query = gql`
    query ExampleQuery($where: Oso_ContractsV0BoolExp) {
      oso_contractsV0(where: $where) {
        contractAddress
        contractNamespace
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
