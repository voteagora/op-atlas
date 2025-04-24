import { processStream } from "./rewards"
import { KYCStreamTeam } from "../types"

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
    rewardStreamId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt,
    projects,
    team: teamMembers,
    rewardStream: null,
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

    const result1 = processStream([team1])
    const result2 = processStream([team2])

    expect(result1.id).toBe(result2.id)
  })

  it("should order wallets correctly based on deletedAt", () => {
    const now = new Date()
    const firstDeleted = new Date(now.getTime() - 2000)
    const secondDeleted = new Date(now.getTime() - 1000)

    const teams = [
      createMockTeam("wallet1", firstDeleted, []),
      createMockTeam("wallet2", secondDeleted, []),
      createMockTeam("wallet3", null, []),
    ]

    const result = processStream(teams)
    expect(result.wallets).toEqual(["wallet1", "wallet2", "wallet3"])
  })

  it("should throw error when multiple active addresses exist", () => {
    const teams = [
      createMockTeam("wallet1", null, []),
      createMockTeam("wallet2", null, []),
    ]

    expect(() => processStream(teams)).toThrow(
      "Multiple active addresses detected",
    )
  })

  it("should correctly calculate KYCStatusCompleted", () => {
    const teams = [
      createMockTeam(
        "wallet1",
        new Date(),
        [],
        [createMockTeamMember("APPROVED"), createMockTeamMember("APPROVED")],
      ),
      createMockTeam("wallet2", null, [], [createMockTeamMember("PENDING")]),
    ]

    const result = processStream(teams)
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

    const team = createMockTeam("wallet1", null, projects)
    const result = processStream([team])

    // Tranche 1: 100 + 300 = 400
    // Tranche 2: 200
    // Tranche 3: 400
    expect(result.amounts).toEqual(["400", "200", "400"])
  })

  it("should use provided streamId when available", () => {
    const team = createMockTeam("wallet1", null, [])
    const customStreamId = "custom-stream-id"
    const result = processStream([team], customStreamId)
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

    const team = createMockTeam("wallet1", null, projects)
    const result = processStream([team])

    expect(result.projectIds).toEqual(["project1"])
    expect(result.projectNames).toEqual(["Project 1"])
  })
})
