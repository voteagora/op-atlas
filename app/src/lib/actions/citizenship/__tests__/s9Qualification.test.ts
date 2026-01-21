import { citizenCategory, CitizenRegistrationStatus } from "@prisma/client"

import { prisma } from "@/db/client"
import { getUserById, getUserWorldId } from "@/db/users"
import { getUserKYCUser } from "@/db/userKyc"
import {
  getCitizenSeasonByUser,
  findBlockedCitizenSeasonEvaluation,
} from "@/db/citizenSeasons"
import {
  getActiveSeason,
  hasRegistrationEnded,
  hasRegistrationStarted,
  isPriorityWindowOpen,
} from "@/lib/seasons"
import { hasPriorityAttestation } from "@/lib/services/priorityAttestations"
import {
  evaluateTrustScores,
  serializeTrustScores,
} from "@/lib/services/citizenTrust"
import { s9Qualification } from "../s9Qualification"

jest.mock("@/db/client", () => ({
  __esModule: true,
  prisma: {
    citizenSeasonEvaluation: { create: jest.fn() },
    citizenQualifyingUser: { findMany: jest.fn() },
  },
}))

jest.mock("@/db/users", () => ({
  __esModule: true,
  getUserById: jest.fn(),
  getUserWorldId: jest.fn(),
}))

jest.mock("@/db/userKyc", () => ({
  __esModule: true,
  getUserKYCUser: jest.fn(),
}))

jest.mock("@/db/citizenSeasons", () => ({
  __esModule: true,
  getCitizenSeasonByUser: jest.fn(),
  checkWalletEligibility: jest.fn(),
  findBlockedCitizenSeasonEvaluation: jest.fn(),
}))

jest.mock("@/lib/seasons", () => ({
  __esModule: true,
  getActiveSeason: jest.fn(),
  getSeasonOrThrow: jest.fn(),
  hasRegistrationEnded: jest.fn(),
  hasRegistrationStarted: jest.fn(),
  isPriorityWindowOpen: jest.fn(),
}))

jest.mock("@/lib/services/priorityAttestations", () => ({
  __esModule: true,
  hasPriorityAttestation: jest.fn(),
}))

jest.mock("@/lib/services/citizenTrust", () => ({
  __esModule: true,
  evaluateTrustScores: jest.fn(),
  serializeTrustScores: jest.fn(),
}))

const mockPrisma = prisma as unknown as {
  citizenSeasonEvaluation: { create: jest.Mock }
  citizenQualifyingUser: { findMany: jest.Mock }
}

const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>
const mockGetUserWorldId =
  getUserWorldId as jest.MockedFunction<typeof getUserWorldId>
const mockGetUserKYCUser =
  getUserKYCUser as jest.MockedFunction<typeof getUserKYCUser>
const mockGetCitizenSeasonByUser =
  getCitizenSeasonByUser as jest.MockedFunction<typeof getCitizenSeasonByUser>
const mockFindBlockedCitizenSeasonEvaluation =
  findBlockedCitizenSeasonEvaluation as jest.MockedFunction<
    typeof findBlockedCitizenSeasonEvaluation
  >
const mockGetActiveSeason =
  getActiveSeason as jest.MockedFunction<typeof getActiveSeason>
const mockHasRegistrationStarted =
  hasRegistrationStarted as jest.MockedFunction<typeof hasRegistrationStarted>
const mockHasRegistrationEnded =
  hasRegistrationEnded as jest.MockedFunction<typeof hasRegistrationEnded>
const mockIsPriorityWindowOpen =
  isPriorityWindowOpen as jest.MockedFunction<typeof isPriorityWindowOpen>
const mockHasPriorityAttestation =
  hasPriorityAttestation as jest.MockedFunction<typeof hasPriorityAttestation>
const mockEvaluateTrustScores =
  evaluateTrustScores as jest.MockedFunction<typeof evaluateTrustScores>
const mockSerializeTrustScores =
  serializeTrustScores as jest.MockedFunction<typeof serializeTrustScores>

const baseSeason = {
  id: "9",
  name: "Season 9",
  registrationStartDate: new Date("2025-01-01"),
  registrationEndDate: new Date("2025-12-31"),
  priorityEndDate: new Date("2025-03-01"),
} as any

const baseUser = {
  id: "user-1",
  farcasterId: null,
  github: null,
  twitter: null,
  addresses: [{ address: "0xabc", primary: true }],
} as any

beforeEach(() => {
  jest.clearAllMocks()

  mockGetActiveSeason.mockResolvedValue(baseSeason)
  mockHasRegistrationStarted.mockReturnValue(true)
  mockHasRegistrationEnded.mockReturnValue(false)
  mockIsPriorityWindowOpen.mockReturnValue(false)
  mockGetCitizenSeasonByUser.mockResolvedValue(null)
  mockFindBlockedCitizenSeasonEvaluation.mockResolvedValue(null)
  mockGetUserById.mockResolvedValue(baseUser)
  mockGetUserWorldId.mockResolvedValue(null)
  mockGetUserKYCUser.mockResolvedValue(null)
  mockHasPriorityAttestation.mockResolvedValue(false)
  mockPrisma.citizenSeasonEvaluation.create.mockResolvedValue({
    id: "evaluation-1",
  })
  mockPrisma.citizenQualifyingUser.findMany.mockResolvedValue([
    { address: "0xabc" },
  ])

  mockSerializeTrustScores.mockReturnValue({
    socialRaw: [],
    passportRaw: [],
  })
})

describe("s9Qualification", () => {
  it("returns READY when user has approved KYC", async () => {
    mockGetUserKYCUser.mockResolvedValue({
      kycUser: { status: "APPROVED" },
    } as any)

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("READY")
    expect(result.kycApproved).toBe(true)
    expect(mockEvaluateTrustScores).not.toHaveBeenCalled()
    expect(mockPrisma.citizenSeasonEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: CitizenRegistrationStatus.READY,
        }),
      }),
    )
  })

  it("returns BLOCKED when user has a blocked evaluation", async () => {
    mockFindBlockedCitizenSeasonEvaluation.mockResolvedValue({
      id: "evaluation-blocked",
    } as any)

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("BLOCKED")
    expect(result.evaluationId).toBe("evaluation-blocked")
    expect(result.message).toContain("disqualifies you from becoming a citizen")
    expect(mockPrisma.citizenSeasonEvaluation.create).not.toHaveBeenCalled()
  })

  it("enforces priority attestation during priority window", async () => {
    mockIsPriorityWindowOpen.mockReturnValue(true)
    mockHasPriorityAttestation.mockResolvedValue(false)

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("PRIORITY_REQUIRED")
    expect(mockEvaluateTrustScores).not.toHaveBeenCalled()
    expect(mockPrisma.citizenSeasonEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
        }),
      }),
    )
  })

  it("returns READY when trust evaluation passes", async () => {
    const trustResult = {
      seasonId: baseSeason.id,
      userId: baseUser.id,
      citizenType: citizenCategory.USER,
      walletScores: [
        {
          address: "0xabc",
          score: 80,
        band: "PLATINUM" as const,
        source: {
          address: "0xabc",
          score: 80,
          status: "ok" as const,
          fetchedAt: new Date(),
          raw: null,
          error: undefined,
        },
        },
        {
          address: "0xdef",
          score: 60,
          band: "GOLD" as const,
          source: {
            address: "0xdef",
            score: 60,
            status: "ok" as const,
            fetchedAt: new Date(),
            raw: null,
            error: undefined,
          },
        },
      ],
      socialScores: [],
      hasPlatinum: true,
      hasGold: true,
      decision: "ALLOW" as const,
    }

    mockEvaluateTrustScores.mockResolvedValue(trustResult)
    mockSerializeTrustScores.mockReturnValue({
      socialRaw: [],
      passportRaw: [
      {
        address: "0xabc",
        status: "ok",
        score: 80,
        band: "PLATINUM",
        error: null,
      },
        {
          address: "0xdef",
          status: "ok",
          score: 60,
          band: "GOLD",
          error: null,
        },
      ],
    })

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("READY")
    expect(result.trust).toEqual(trustResult)
    expect(result.hasGold).toBe(true)
    expect(result.hasPlatinum).toBe(true)
    expect(mockEvaluateTrustScores).toHaveBeenCalled()
    expect(mockPrisma.citizenSeasonEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: CitizenRegistrationStatus.READY,
          passportRaw: expect.anything(),
        }),
      }),
    )
  })

  it("requires additional verification when trust thresholds are not met", async () => {
    const trustResult = {
      seasonId: baseSeason.id,
      userId: baseUser.id,
      citizenType: citizenCategory.USER,
      walletScores: [
        {
          address: "0xabc",
          score: 40,
        band: "SILVER" as const,
        source: {
          address: "0xabc",
          score: 40,
          status: "ok" as const,
          fetchedAt: new Date(),
          raw: null,
          error: undefined,
        },
        },
      ],
      socialScores: [],
      hasPlatinum: false,
      hasGold: false,
      decision: "NEEDS_VERIFICATION" as const,
    }

    mockEvaluateTrustScores.mockResolvedValue(trustResult)
    mockSerializeTrustScores.mockReturnValue({ socialRaw: [], passportRaw: [] })

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("NEEDS_VERIFICATION")
    expect(result.trust).toEqual(trustResult)
    expect(mockPrisma.citizenSeasonEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: CitizenRegistrationStatus.VERIFICATION_REQUIRED,
        }),
      }),
    )
  })

  it("marks user as blocked when any wallet has a zero passport score", async () => {
    const trustResult = {
      seasonId: baseSeason.id,
      userId: baseUser.id,
      citizenType: citizenCategory.USER,
      walletScores: [
        {
          address: "0xabc",
          score: 0,
        band: "NONE" as const,
        source: {
          address: "0xabc",
          score: 0,
          status: "blocked" as const,
          fetchedAt: new Date(),
          raw: null,
          error: undefined,
        },
        },
      ],
      socialScores: [],
      hasPlatinum: false,
      hasGold: false,
      decision: "BLOCKED" as const,
    }

    mockEvaluateTrustScores.mockResolvedValue(trustResult)
    mockSerializeTrustScores.mockReturnValue({
      socialRaw: [],
      passportRaw: [
      {
        address: "0xabc",
        status: "blocked",
        score: 0,
        band: "NONE",
        error: null,
      },
      ],
    })

    const result = await s9Qualification({
      userId: "user-1",
      governanceAddress: "0xabc",
    })

    expect(result.status).toBe("BLOCKED")
    expect(result.reason).toBe("BLOCKED")
    expect(mockPrisma.citizenSeasonEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: CitizenRegistrationStatus.BLOCKED,
        }),
      }),
    )
  })
})
