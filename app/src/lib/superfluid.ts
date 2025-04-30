/**
 * Interactions with the Superfluid supgraph to query data
 */

import { gql, GraphQLClient } from "graphql-request"

const SUBGRAPH_URL = "https://optimism-mainnet.subgraph.x.superfluid.dev"
const GRANT_SENDER = "0xC68f72d6b90cA1cf8DfC7fde6c4d452b309d86BB"

const GRANT_SENDER_MAP = {
  7: "0xA2928CC2D210bC42d8ffe5Ad8b1314E872F5fb54",
  8: "0x823557699A455F3c2C6f964017880f3f3a6583Ac",
}

const client = new GraphQLClient(SUBGRAPH_URL)

export interface SuperfluidStream {
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

export async function getStreams({
  sender,
  receiver,
}: {
  sender: string
  receiver?: string
}) {
  const where = {
    sender,
    ...(receiver && { receiver: receiver.toLowerCase() }),
  }

  const query = gql`
    {
      streams(
        where: ${JSON.stringify(where)}
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

  return client.request<{ streams: SuperfluidStream[] }>(query)
}

// We consider a stream active if the flow rate is greater than zero
export async function getActiveStreams(receiver: string) {
  const { streams } = await getStreams({
    receiver,
    sender: GRANT_SENDER,
  })
  return streams.filter((stream) => parseFloat(stream.currentFlowRate) > 0)
}

export async function getStreamsForRound(round: number) {
  if (!(round in Object.keys(GRANT_SENDER_MAP))) {
    return []
  }
  const { streams } = await getStreams({
    sender: GRANT_SENDER_MAP[round as keyof typeof GRANT_SENDER_MAP],
  })
  return streams
}
