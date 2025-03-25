import { NextRequest, NextResponse } from "next/server"

import { authenticateApiUser } from "@/serverAuth"

/**
 * Test cases:
 * 1. Usual recipient that has completed KYC from Tranche 1
 * 2. Recipient that has accrued OP since Tranche 1 but not completed KYC until Tranche 3
 * 3. Recipient that has started accruing OP from Tranche 2 and completed KYC later during Tranche 4
 * 4. Recipient that has changed wallet
 * 5. Recipient that dropped out from receiving OP from Tranche 3 so all following value are zero and the schedule needs to be stopped
 * etc.
 */

const MOCK_REWARDS_TRACHE_1 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: ["100000000000000000000"],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: false,
    amounts: ["200000000000000000000"],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: ["0x3456789012345678901234567890123456789012"],
    KYCStatusCompleted: true,
    amounts: ["400000000000000000000"],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: ["500000000000000000000"],
  },
]

const MOCK_REWARDS_TRACHE_2 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: ["100000000000000000000", "100000000000000000000"],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: false,
    amounts: ["200000000000000000000", "250000000000000000000"],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a88",
    projectName: "Project 3",
    wallets: ["0x7890123456789012345678901234567890abcdef"],
    KYCStatusCompleted: false,
    amounts: ["0", "350000000000000000000"],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: ["0x3456789012345678901234567890123456789012"],
    KYCStatusCompleted: true,
    amounts: ["400000000000000000000", "450000000000000000000"],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: ["500000000000000000000", "550000000000000000000"],
  },
]

const MOCK_REWARDS_TRACHE_3 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: [
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
    ],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: true,
    amounts: [
      "200000000000000000000",
      "250000000000000000000",
      "250000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a88",
    projectName: "Project 3",
    wallets: ["0x7890123456789012345678901234567890abcdef"],
    KYCStatusCompleted: false,
    amounts: ["0", "350000000000000000000", "350000000000000000000"],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: [
      "0x3456789012345678901234567890123456789012",
      "0x8901234567890123456789012345678901abcdef0",
    ],
    KYCStatusCompleted: false,
    amounts: [
      "400000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
    ],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: ["500000000000000000000", "250000000000000000000", "0"],
  },
]

const MOCK_REWARDS_TRACHE_4 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: [
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
    ],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: true,
    amounts: [
      "200000000000000000000",
      "250000000000000000000",
      "250000000000000000000",
      "200000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a88",
    projectName: "Project 3",
    wallets: ["0x7890123456789012345678901234567890abcdef"],
    KYCStatusCompleted: true,
    amounts: [
      "0",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: [
      "0x3456789012345678901234567890123456789012",
      "0x8901234567890123456789012345678901abcdef0",
    ],
    KYCStatusCompleted: false,
    amounts: [
      "400000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
    ],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: ["500000000000000000000", "250000000000000000000", "0", "0"],
  },
]

const MOCK_REWARDS_TRACHE_5 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: [
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
    ],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: true,
    amounts: [
      "200000000000000000000",
      "250000000000000000000",
      "250000000000000000000",
      "200000000000000000000",
      "200000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a88",
    projectName: "Project 3",
    wallets: ["0x7890123456789012345678901234567890abcdef"],
    KYCStatusCompleted: true,
    amounts: [
      "0",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: [
      "0x3456789012345678901234567890123456789012",
      "0x8901234567890123456789012345678901abcdef0",
    ],
    KYCStatusCompleted: true,
    amounts: [
      "400000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
    ],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: ["500000000000000000000", "250000000000000000000", "0", "0", "0"],
  },
]

const MOCK_REWARDS_TRACHE_6 = [
  {
    projectId:
      "0x9aa8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a84",
    projectName: "Project 1",
    wallets: ["0x1234567890123456789012345678901234567890"],
    KYCStatusCompleted: true,
    amounts: [
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
      "100000000000000000000",
    ],
  },
  {
    projectId:
      "0x9bb8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a85",
    projectName: "Project 2",
    wallets: ["0x2345678901234567890123456789012345678901"],
    KYCStatusCompleted: true,
    amounts: [
      "200000000000000000000",
      "250000000000000000000",
      "250000000000000000000",
      "200000000000000000000",
      "200000000000000000000",
      "250000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a88",
    projectName: "Project 3",
    wallets: ["0x7890123456789012345678901234567890abcdef"],
    KYCStatusCompleted: true,
    amounts: [
      "0",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
      "350000000000000000000",
    ],
  },
  {
    projectId:
      "0x9cc8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a86",
    projectName: "Project 4",
    wallets: [
      "0x3456789012345678901234567890123456789012",
      "0x8901234567890123456789012345678901abcdef0",
    ],
    KYCStatusCompleted: true,
    amounts: [
      "400000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
      "450000000000000000000",
    ],
  },
  {
    projectId:
      "0x9dd8d3f8aa6793dba4176f706571c16650bb6343bb7c56ac9dd249d6db3b2a87",
    projectName: "Project 5",
    wallets: ["0x4567890123456789012345678901234567890123"],
    KYCStatusCompleted: true,
    amounts: [
      "500000000000000000000",
      "250000000000000000000",
      "0",
      "0",
      "0",
      "0",
    ],
  },
]

export const GET = async (req: NextRequest) => {
  // const authResponse = await authenticateApiUser(req)

  // if (!authResponse.authenticated) {
  //   return new Response(authResponse.failReason, { status: 401 })
  // }

  // Rotate through the mock rewards every 10 sec
  const mockRewards = [
    MOCK_REWARDS_TRACHE_1,
    MOCK_REWARDS_TRACHE_2,
    MOCK_REWARDS_TRACHE_3,
    MOCK_REWARDS_TRACHE_4,
    MOCK_REWARDS_TRACHE_5,
    MOCK_REWARDS_TRACHE_6,
  ]

  const currentIndex = Math.floor(Date.now() / 10000) % mockRewards.length

  return NextResponse.json(mockRewards[currentIndex])
}
