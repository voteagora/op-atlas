import { gql, GraphQLClient } from "graphql-request"

const SUBGRAPH_URL = "https://www.opensource.observer/api/v1/graphql"

const client = new GraphQLClient(SUBGRAPH_URL, {
  headers: {
    Authorization: `Bearer ${"XMT6GzRP1q7lk4KuiV3950B/IOC64jo_"}`,
  },
})

export async function getDeployedContracts({ deployer }: { deployer: string }) {
  console.log("HERE with " + deployer)

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

  console.log("HERE 2 with " + deployer)

  const req = await client.request(query, variables)

  console.log("HEER 3")
  console.log(req)

  return req
}
