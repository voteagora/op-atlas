import {
  getAllContributors,
  getAllGithubRepoBuiulders,
  getAllOnchainBuilders,
} from "@/db/users"

import {
  getAttestationsForAddresses,
  getTagEligibleRecordsWithClient,
  isAnyBadgeholderAddress,
  isBadgeholderAddress,
  parseEntity,
} from "../repository"

jest.mock("@/db/client", () => ({
  prisma: {},
}))

jest.mock("@/db/users", () => ({
  getAllContributors: jest.fn(),
  getAllGithubRepoBuiulders: jest.fn(),
  getAllOnchainBuilders: jest.fn(),
}))

jest.mock("@/lib/db/sessionContext", () => ({
  withImpersonation: jest.fn(),
}))

const mockGetAllContributors = getAllContributors as jest.MockedFunction<
  typeof getAllContributors
>
const mockGetAllOnchainBuilders = getAllOnchainBuilders as jest.MockedFunction<
  typeof getAllOnchainBuilders
>
const mockGetAllGithubRepoBuiulders =
  getAllGithubRepoBuiulders as jest.MockedFunction<
    typeof getAllGithubRepoBuiulders
  >

describe("EAS repository", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("parseEntity", () => {
    const baseRecord = {
      id: "0xattestation",
      address: "0x1234567890123456789012345678901234567890",
      attester: "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9",
      created_at: 1705320000,
      revoked_at: null,
    }

    it("formats citizen attestations", () => {
      expect(
        parseEntity(
          {
            ...baseRecord,
            farcaster_id: "123",
            selection_method: "manual",
          },
          "citizen",
        ),
      ).toMatchObject({
        entity: "citizen",
        name: "Citizen",
        subtext: "Since Jan 2024",
        metadata: {},
      })
    })

    it("formats badgeholder attestations", () => {
      expect(
        parseEntity(
          {
            ...baseRecord,
            rpgf_round: "5",
            referred_by: "0x0000000000000000000000000000000000000000",
            referred_method: null,
          },
          "badgeholder",
        ),
      ).toMatchObject({
        entity: "badgeholder",
        name: "Retro Funding Voter",
        subtext: "Round 5",
        metadata: {},
      })
    })

    it("formats governance contribution attestations", () => {
      expect(
        parseEntity(
          {
            ...baseRecord,
            gov_role: "Grants Council",
            gov_season: "7",
          },
          "gov_contribution",
        ),
      ).toMatchObject({
        entity: "gov_contribution",
        name: "Grants Council",
        subtext: "Season 7",
        metadata: {
          role: "Grants Council",
          season: "7",
        },
      })
    })

    it("formats retro funding voter attestations", () => {
      expect(
        parseEntity(
          {
            ...baseRecord,
            farcaster_id: "456",
            round: "6",
            voter_type: "Guest",
            voting_group: "A",
            selection_method: "manual",
          },
          "rf_voter",
        ),
      ).toMatchObject({
        entity: "rf_voter",
        name: "Retro Funding Voter",
        subtext: "Voter Type: Guest; Round 6",
        metadata: {
          voterType: "Guest",
          round: "6",
        },
      })
    })

    it("formats vote attestations", () => {
      expect(
        parseEntity(
          {
            ...baseRecord,
            proposal_id: "42",
            params: "[1]",
            voter_id: "0xvoter",
            block_number: 123,
          },
          "votes",
        ),
      ).toMatchObject({
        entity: "votes",
        name: "Vote",
        subtext: "Proposal 42",
        metadata: {
          proposalId: "42",
          params: "[1]",
          voterId: "0xvoter",
        },
      })
    })
  })

  describe("badgeholder checks", () => {
    it("checks one address", async () => {
      const db = {
        $queryRaw: jest.fn().mockResolvedValue([{ exists: true }]),
      } as any

      await expect(
        isBadgeholderAddress("0x1234567890123456789012345678901234567890", db),
      ).resolves.toBe(true)

      expect(db.$queryRaw).toHaveBeenCalledTimes(1)
    })

    it("checks multiple addresses and ignores invalid input", async () => {
      const db = {
        $queryRaw: jest.fn().mockResolvedValue([{ exists: false }]),
      } as any

      await expect(
        isAnyBadgeholderAddress(
          [
            "not-an-address",
            "0x1234567890123456789012345678901234567890",
            "0x1234567890123456789012345678901234567890",
          ],
          db,
        ),
      ).resolves.toBe(false)

      expect(db.$queryRaw).toHaveBeenCalledTimes(1)
    })

    it("does not query for empty or invalid address lists", async () => {
      const db = {
        $queryRaw: jest.fn(),
      } as any

      await expect(isAnyBadgeholderAddress(["invalid"], db)).resolves.toBe(
        false,
      )

      expect(db.$queryRaw).not.toHaveBeenCalled()
    })
  })

  it("reads attestations for all entities in one batch", async () => {
    const db = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: "citizen-1",
            address: "0x1234567890123456789012345678901234567890",
            farcaster_id: "1",
            selection_method: "manual",
            attester: "0xattester",
            created_at: 1705320000,
            revoked_at: null,
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: "vote-1",
            address: "0x1234567890123456789012345678901234567890",
            proposal_id: "42",
            params: "[1]",
            voter_id: "0xvoter",
            attester: "0xattester",
            created_at: 1705320000,
            revoked_at: null,
            block_number: 100,
          },
        ]),
    } as any

    await expect(
      getAttestationsForAddresses(
        ["0x1234567890123456789012345678901234567890"],
        db,
      ),
    ).resolves.toEqual([
      expect.objectContaining({ entity: "citizen", id: "citizen-1" }),
      expect.objectContaining({ entity: "votes", id: "vote-1" }),
    ])

    expect(db.$queryRaw).toHaveBeenCalledTimes(5)
  })

  it("builds tag records with S7 and guest voter filters", async () => {
    const db = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([
          {
            address: "0x1111111111111111111111111111111111111111",
            email: "citizen@example.com",
          },
        ])
        .mockResolvedValueOnce([
          {
            address: "0x2222222222222222222222222222222222222222",
            email: "gov@example.com",
          },
        ])
        .mockResolvedValueOnce([
          {
            address: "0x3333333333333333333333333333333333333333",
            email: "rf@example.com",
          },
        ]),
    } as any

    mockGetAllContributors.mockResolvedValue([
      {
        addresses: [{ address: "0x4444444444444444444444444444444444444444" }],
        emails: [{ email: "contributor@example.com" }],
      },
    ] as any)
    mockGetAllOnchainBuilders.mockResolvedValue([
      {
        addresses: [{ address: "0x5555555555555555555555555555555555555555" }],
        emails: [{ email: "onchain@example.com" }],
      },
    ] as any)
    mockGetAllGithubRepoBuiulders.mockResolvedValue([
      {
        addresses: [{ address: "0x6666666666666666666666666666666666666666" }],
        emails: [{ email: "github@example.com" }],
      },
    ] as any)

    await expect(getTagEligibleRecordsWithClient(db)).resolves.toEqual({
      citizen: [
        {
          address: "0x1111111111111111111111111111111111111111",
          email: "citizen@example.com",
        },
      ],
      gov_contribution: [
        {
          address: "0x2222222222222222222222222222222222222222",
          email: "gov@example.com",
        },
      ],
      rf_voter: [
        {
          address: "0x3333333333333333333333333333333333333333",
          email: "rf@example.com",
        },
      ],
      contributors: [
        {
          address: "0x4444444444444444444444444444444444444444",
          email: "contributor@example.com",
        },
      ],
      onchain_builders: [
        {
          address: "0x5555555555555555555555555555555555555555",
          email: "onchain@example.com",
        },
      ],
      github_repo_builders: [
        {
          address: "0x6666666666666666666666666666666666666666",
          email: "github@example.com",
        },
      ],
    })

    const sourceQueries = db.$queryRaw.mock.calls.map((call: any[]) => call[1])
    expect(sourceQueries[1].strings.join(" ")).toContain("gov_season")
    expect(sourceQueries[1].values).toEqual(["7"])
    expect(sourceQueries[2].strings.join(" ")).toContain("voter_type")
    expect(sourceQueries[2].values).toEqual(["Guest"])
  })
})
