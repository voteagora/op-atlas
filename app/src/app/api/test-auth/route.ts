/**
 * Test Authentication API
 * POST /api/test-auth – creates a NextAuth session for a test user
 * Used by Playwright tests to authenticate without Privy.
 */

import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const testUserId: string = body?.userId || "test-user-123"

    // Use Credentials provider in test mode; do not redirect
    await signIn("credentials", {
      testMode: "true",
      testUserId,
      redirect: false,
    })

    return NextResponse.json({ success: true, userId: testUserId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

