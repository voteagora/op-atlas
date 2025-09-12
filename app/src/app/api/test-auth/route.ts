import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/auth"
import { isTestMode } from "@/lib/auth/testMode"
import { getOrCreateTestUser } from "@/db/testUsers"

export async function POST(request: NextRequest) {
  // Allow in test mode OR when called from localhost (for Playwright tests)
  const isLocalhost = request.headers.get("host")?.includes("localhost")
  const isTestModeActive = isTestMode()

  if (!isTestModeActive && !isLocalhost) {
    return NextResponse.json(
      {
        error: "Test auth only available in test mode or localhost",
        debug: {
          NODE_ENV: process.env.NODE_ENV,
          ATLAS_TEST_MODE: process.env.ATLAS_TEST_MODE,
          USE_TEST_AUTH: process.env.USE_TEST_AUTH,
          NEXT_PUBLIC_ATLAS_TEST_MODE: process.env.NEXT_PUBLIC_ATLAS_TEST_MODE,
          NEXT_PUBLIC_USE_TEST_AUTH: process.env.NEXT_PUBLIC_USE_TEST_AUTH,
          isTestMode: isTestModeActive,
          isLocalhost: isLocalhost,
        },
      },
      { status: 403 },
    )
  }

  try {
    const { userId } = await request.json()

    // Get or create test user
    const testUser = await getOrCreateTestUser(userId || "test-user-123")

    // Create a mock session by calling signIn with test credentials
    const result = await signIn("credentials", {
      privy: JSON.stringify({
        id: testUser.privyDid,
        email: { address: testUser.emails?.[0]?.email || "test@example.com" },
        createdAt: testUser.createdAt.toISOString(),
      }),
      privyAccessToken: "mock-test-token",
      testMode: "true",
      testUserId: testUser.id,
      redirect: false,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.emails?.[0]?.email || "test@example.com",
        imageUrl: testUser.imageUrl,
      },
    })
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
