import { KYCStreamTeam, StreamWithKYCTeam } from "../types"
import { processStream } from "./rewards"

describe("processStream", () => {
  const season = 7
  const round = "7"
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
        personaStatus: null
        kycUserType: "USER"
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
      personaStatus: null,
      kycUserType: "USER" as const,
    },
  })

  it("should generate consistent stream ID regardless of project order", async () => {
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

    const result1 = await processStream([], team1, round, season)
    const result2 = await processStream([], team2, round, season)
    expect(result1).not.toBeNull()
    expect(result2).not.toBeNull()
    expect(result1!.id).toBe(result2!.id)
  })

  it("should order wallets based on stream creation time", async () => {
    const now = new Date()
    const firstCreated = new Date(now.getTime() - 2000)
    const secondCreated = new Date(now.getTime() - 1000)

    const streams = [
      createMockStream("wallet1", firstCreated),
      createMockStream("wallet2", secondCreated),
    ]
    const minimalProject = {
      id: "p1",
      name: "P1",
      recurringRewards: [createMockReward(1, "1", "p1")],
    }
    const currentTeam = createMockTeam("wallet3", null, [minimalProject])

    const result = await processStream(streams, currentTeam, round, season)
    expect(result).not.toBeNull()
    expect(result!.wallets).toEqual(["wallet1", "wallet2", "wallet3"])
  })

  it("should handle streams with reward stream relationships", async () => {
    const now = new Date()
    const firstCreated = new Date(now.getTime() - 2000)
    const secondCreated = new Date(now.getTime() - 1000)
    const rewardStreamId = "reward-stream-id"

    // Create two streams for different teams, both linked to the same reward stream
    const streams = [
      createMockStream("wallet1", firstCreated, rewardStreamId),
      createMockStream("wallet2", secondCreated, rewardStreamId),
    ]
    const minimalProject = {
      id: "p1",
      name: "P1",
      recurringRewards: [createMockReward(1, "1", "p1")],
    }
    const currentTeam = createMockTeam("wallet3", null, [minimalProject])

    const result = await processStream(streams, currentTeam, round, season)

    // Should include all wallets in order of stream creation
    expect(result).not.toBeNull()
    expect(result!.wallets).toEqual(["wallet1", "wallet2", "wallet3"])
  })

  it("should correctly calculate KYCStatusCompleted", async () => {
    const now = new Date()
    const streams = [createMockStream("wallet1", now)]
    const currentTeam = createMockTeam(
      "wallet2",
      null,
      [
        {
          id: "p1",
          name: "P1",
          recurringRewards: [createMockReward(1, "1", "p1")],
        },
      ],
      [createMockTeamMember("PENDING")],
    )

    const result = await processStream(streams, currentTeam, round, season)
    expect(result).not.toBeNull()
    expect(result!.KYCStatusCompleted).toBe(false)
  })

  it("should correctly calculate amounts for different tranches", async () => {
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
    const result = await processStream([], currentTeam, round, season)

    // Tranche 1: 100 + 300 = 400
    // Tranche 2: 200
    // Tranche 3: 400
    expect(result).not.toBeNull()
    expect(result!.amounts).toEqual(["400", "200", "400", "0", "0", "0"])
  })

  it("should use provided streamId when available", async () => {
    const currentTeam = createMockTeam("wallet1", null, [
      { id: "p1", name: "P1", recurringRewards: [createMockReward(1, "1", "p1")] },
    ])
    const customStreamId = "custom-stream-id"
    const result = await processStream([], currentTeam, round, season, customStreamId)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(customStreamId)
  })

  it("should filter out projects without recurring rewards", async () => {
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
    const result = await processStream([], currentTeam, round, season)

    expect(result).not.toBeNull()
    expect(result!.projectIds).toEqual(["project1"])
    expect(result!.projectNames).toEqual(["Project 1"])
  })
})
