/**
 * Interactions with the Superfluid supgraph to query data
 */

import { gql, GraphQLClient } from "graphql-request"

const SUBGRAPH_URL = "https://optimism-mainnet.subgraph.x.superfluid.dev"
const VESTING_SUBGRAPH_URL =
  "https://subgraph-endpoints.superfluid.dev/optimism-mainnet/vesting-scheduler"
const GRANT_SENDER = "0xC68f72d6b90cA1cf8DfC7fde6c4d452b309d86BB"

const GRANT_SENDER_MAP = {
  7: "0xA2928CC2D210bC42d8ffe5Ad8b1314E872F5fb54",
  8: "0x823557699A455F3c2C6f964017880f3f3a6583Ac",
}

const client = new GraphQLClient(SUBGRAPH_URL)
const vestingClient = new GraphQLClient(VESTING_SUBGRAPH_URL)

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

export interface SuperfluidVestingSchedule {
  id: string
  sender: string
  receiver: string
  flowRate: string
  createdAt: string
  claimedAt: string
  startDate: string
  totalAmount: string
  endExecutedAt: string
  failedAt: string
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

async function getVestingSchedules({ sender }: { sender: string }) {
  const query = gql`
    {
      vestingSchedules(
        where: { sender: "${sender}", deletedAt: null }
      ) {
        id
        sender
        receiver
        flowRate
        createdAt
        claimedAt
        startDate
        totalAmount
        endExecutedAt
        failedAt
      }
    }
  `

  return vestingClient.request<{
    vestingSchedules: SuperfluidVestingSchedule[]
  }>(query)
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
  if (!Object.keys(GRANT_SENDER_MAP).includes(round.toString())) {
    return []
  }
  const { vestingSchedules } = await getVestingSchedules({
    sender: GRANT_SENDER_MAP[round as keyof typeof GRANT_SENDER_MAP],
  })
  return groupVestingSchedules(vestingSchedules)
}

function groupVestingSchedules(vestingSchedules: SuperfluidVestingSchedule[]) {
  function getTimestamp(value: string) {
    if (!value) return null
    return parseInt(value) * 1000 // Convert seconds to milliseconds
  }

  // group by receiver
  const grouped = vestingSchedules.reduce((acc, schedule) => {
    acc[schedule.receiver] = acc[schedule.receiver] || []
    acc[schedule.receiver].push(schedule)
    return acc
  }, {} as Record<string, SuperfluidVestingSchedule[]>)

  for (const receiver in grouped) {
    grouped[receiver].sort((a, b) => {
      const aEndTime = getTimestamp(a.endExecutedAt)
      const bEndTime = getTimestamp(b.endExecutedAt)
      const aFailTime = getTimestamp(a.failedAt)
      const bFailTime = getTimestamp(b.failedAt)

      // Active streams (null endExecutedAt) should come first
      if (aEndTime === null && bEndTime !== null) return -1
      if (bEndTime === null && aEndTime !== null) return 1

      // If both are active or both are completed, sort by endExecutedAt (most recent first)
      if (aEndTime !== null && bEndTime !== null) {
        return bEndTime - aEndTime
      }

      // If both are active (both null), put streams without failures first
      return (aFailTime || 0) - (bFailTime || 0)
    })
  }

  return Object.values(grouped).map((schedules) => {
    return schedules[0]
  })
}
