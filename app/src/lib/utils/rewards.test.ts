import { KYCStreamTeam, StreamWithKYCTeam } from "../types"
import { processStream } from "./rewards"

describe("processStream", () => {
  const createMockTeam = (
    walletAddress: string,
    deletedAt: Date | null,
    projects: Array<{
      id: string
      name: string
      recurringRewards: Array<{
        id: string
        createdAt: Date
        updatedAt: Date
        deletedAt: Date | null
        roundId: string
        tranche: number
        projectId: string
        amount: string
      }>
    }>,
    teamMembers: Array<{
      id: string
      createdAt: Date
      updatedAt: Date
      kycTeamId: string
      kycUserId: string
      users: {
        id: string
        createdAt: Date
        updatedAt: Date
        email: string
        firstName: string
        lastName: string
        businessName: string | null
        status: "PENDING" | "APPROVED" | "REJECTED"
        expiry: Date
      }
    }> = [],
  ): KYCStreamTeam => ({
    id: "kyc-team-id",
    walletAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt,
    projects,
    team: teamMembers,
    rewardStreams: [],
  })

  const createMockStream = (
    walletAddress: string,
    createdAt: Date,
    rewardStreamId?: string,
  ): StreamWithKYCTeam => ({
    id: "stream-id",
    sender: "sender-address",
    receiver: walletAddress,
    flowRate: "100",
    deposit: "1000",
    createdAt,
    updatedAt: new Date(),
    deletedAt: null,
    internalStreamId: rewardStreamId ?? null,
    kycTeam: {
      id: "kyc-team-id",
      walletAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  })

  const createMockReward = (
    tranche: number,
    amount: string,
    projectId: string,
  ) => ({
    id: "reward-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roundId: "round-id",
    tranche,
    projectId,
    amount,
  })

  const createMockTeamMember = (
    status: "PENDING" | "APPROVED" | "REJECTED",
  ) => ({
    id: "team-member-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    kycTeamId: "kyc-team-id",
    kycUserId: "kyc-user-id",
    users: {
      id: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      businessName: null,
      status,
      expiry: new Date(),
    },
  })

  it("should generate consistent stream ID regardless of project order", () => {
    const projects = [
      {
        id: "project1",
        name: "Project 1",
        recurringRewards: [createMockReward(1, "100", "project1")],
      },
      {
        id: "project2",
        name: "Project 2",
        recurringRewards: [createMockReward(1, "200", "project2")],
      },
    ]

    const team1 = createMockTeam("wallet1", null, projects)
    const team2 = createMockTeam("wallet1", null, [...projects].reverse())

    const result1 = processStream([], team1, "round-id")
    const result2 = processStream([], team2, "round-id")

    expect(result1.id).toBe(result2.id)
  })

  it("should order wallets based on stream creation time", () => {
    const now = new Date()
    const firstCreated = new Date(now.getTime() - 2000)
    const secondCreated = new Date(now.getTime() - 1000)

    const streams = [
      createMockStream("wallet1", firstCreated),
      createMockStream("wallet2", secondCreated),
    ]
    const currentTeam = createMockTeam("wallet3", null, [])

    const result = processStream(streams, currentTeam, "round-id")
    expect(result.wallets).toEqual(["wallet1", "wallet2", "wallet3"])
  })

  it("should handle streams with reward stream relationships", () => {
    const now = new Date()
    const firstCreated = new Date(now.getTime() - 2000)
    const secondCreated = new Date(now.getTime() - 1000)
    const rewardStreamId = "reward-stream-id"

    // Create two streams for different teams, both linked to the same reward stream
    const streams = [
      createMockStream("wallet1", firstCreated, rewardStreamId),
      createMockStream("wallet2", secondCreated, rewardStreamId),
    ]
    const currentTeam = createMockTeam("wallet3", null, [])

    const result = processStream(streams, currentTeam, "round-id")

    // Should include all wallets in order of stream creation
    expect(result.wallets).toEqual(["wallet1", "wallet2", "wallet3"])
  })

  it("should correctly calculate KYCStatusCompleted", () => {
    const now = new Date()
    const streams = [createMockStream("wallet1", now)]
    const currentTeam = createMockTeam(
      "wallet2",
      null,
      [],
      [createMockTeamMember("PENDING")],
    )

    const result = processStream(streams, currentTeam, "round-id")
    expect(result.KYCStatusCompleted).toBe(false)
  })

  it("should correctly calculate amounts for different tranches", () => {
    const projects = [
      {
        id: "project1",
        name: "Project 1",
        recurringRewards: [
          createMockReward(1, "100", "project1"),
          createMockReward(2, "200", "project1"),
        ],
      },
      {
        id: "project2",
        name: "Project 2",
        recurringRewards: [
          createMockReward(1, "300", "project2"),
          createMockReward(3, "400", "project2"),
        ],
      },
    ]

    const currentTeam = createMockTeam("wallet1", null, projects)
    const result = processStream([], currentTeam, "round-id")

    // Tranche 1: 100 + 300 = 400
    // Tranche 2: 200
    // Tranche 3: 400
    expect(result.amounts).toEqual(["400", "200", "400"])
  })

  it("should use provided streamId when available", () => {
    const currentTeam = createMockTeam("wallet1", null, [])
    const customStreamId = "custom-stream-id"
    const result = processStream([], currentTeam, "round-id", customStreamId)
    expect(result.id).toBe(customStreamId)
  })

  it("should filter out projects without recurring rewards", () => {
    const projects = [
      {
        id: "project1",
        name: "Project 1",
        recurringRewards: [createMockReward(1, "100", "project1")],
      },
      {
        id: "project2",
        name: "Project 2",
        recurringRewards: [],
      },
    ]

    const currentTeam = createMockTeam("wallet1", null, projects)
    const result = processStream([], currentTeam, "round-id")

    expect(result.projectIds).toEqual(["project1"])
    expect(result.projectNames).toEqual(["Project 1"])
  })
})
