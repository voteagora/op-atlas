import { formatUnits, keccak256, parseUnits } from "viem"

export function generateRewardStreamId(projectIds: string[]) {
  return keccak256(Buffer.from(projectIds.sort().join("")))
}

type ProjectWithRewards = {
  recurringRewards: Array<{
    tranche: number
    amount: string
  }>
}

function sumBigNumbers(numbers: string[]): string {
  const total = numbers.reduce((acc, curr) => {
    const parsed = parseUnits(curr, 18)
    return acc + parsed
  }, BigInt(0))
  return formatUnits(total, 18)
}

function calculateRewardAmounts(projectsWithRewards: ProjectWithRewards[]) {
  // TODO: Make sure we're summing rewards for the same tranche
  return projectsWithRewards
    .map((project) =>
      project.recurringRewards
        .sort((a, b) => a.tranche - b.tranche) // Sort by tranche asc
        .map((reward) => reward.amount),
    )
    .sort((a, b) => b.length - a.length) // Sort descending so longest array is first
    .reduce((acc, curr) =>
      curr.map((amount, index) => sumBigNumbers([acc[index], amount])),
    )
}

type StreamTeam = {
  deletedAt: Date | null
  projects: Array<{
    id: string
    name: string
    recurringRewards: Array<{
      tranche: number
      amount: string
    }>
  }>
  walletAddress: string
  team: Array<{
    users: {
      status: string
    }
  }>
}

export function processStream(teams: StreamTeam[], streamId?: string) {
  // Order teams by deletedAt: deletedAt is null for the current team -- current team comes last
  const orderedTeams = teams.sort((a, b) => {
    if (a.deletedAt === null && b.deletedAt === null)
      throw new Error("Multiple active addresses detected")
    if (a.deletedAt === null) return 1
    if (b.deletedAt === null) return -1
    return a.deletedAt.getTime() - b.deletedAt.getTime()
  })

  const currentTeam = orderedTeams[0]

  if (!currentTeam) {
    throw new Error("No team found for stream")
  }

  const projectsWithRewards = currentTeam.projects.filter(
    (project) => project.recurringRewards.length > 0,
  )

  return {
    id:
      streamId ?? generateRewardStreamId(projectsWithRewards.map((p) => p.id)),
    projectIds: projectsWithRewards.map((project) => project.id),
    projectNames: projectsWithRewards.map((project) => project.name),
    wallets: orderedTeams.map((team) => team.walletAddress),
    KYCStatusCompleted: currentTeam.team.every(
      (team) => team.users.status === "APPROVED",
    ),
    amounts: calculateRewardAmounts(projectsWithRewards),
  }
}
