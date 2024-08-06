/**
 * Interactions with the Superfluid supgraph to query data
 */

import { gql, GraphQLClient } from "graphql-request"

const SUBGRAPH_URL = "https://optimism-mainnet.subgraph.x.superfluid.dev"

const client = new GraphQLClient(SUBGRAPH_URL)

interface Stream {
  id: string
  deposit: string
  currentFlowRate: string
  createdAtTimestamp: string
  updatedAtTimestamp: string
  streamedUntilUpdatedAt: string
  sender: {
    id: string
  }
  receiver: {
    id: string
  }
}

export async function getStreams({ recipient }: { recipient: string }) {
  const query = gql`
    {
      streams(
        where: { sender: "0xC68f72d6b90cA1cf8DfC7fde6c4d452b309d86BB", receiver: "${recipient}" }
      ) {
        id
        deposit
        currentFlowRate
        createdAtTimestamp
        updatedAtTimestamp
        streamedUntilUpdatedAt
        sender {
          id
        }
        receiver {
          id
        }
      }
    }
  `

  return client.request<{ streams: Stream[] }>(query)
}

// We consider a stream active if the flow rate is greater than zero
export async function getActiveStreams(recipient: string) {
  const { streams } = await getStreams({ recipient })
  return streams.filter((stream) => parseFloat(stream.currentFlowRate) > 0)
}
