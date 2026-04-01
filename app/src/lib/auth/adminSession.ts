import "server-only"

import type { Session } from "next-auth"
import { NextResponse } from "next/server"

import { auth } from "@/auth"

import { isAdminUser, isImpersonationEnabled } from "./adminConfig"

type RequireAdminSessionOptions = {
  requireAdminFeature?: boolean
  disabledMessage?: string
  noSessionMessage?: string
  forbiddenMessage?: string
}

type RequireAdminSessionResult =
  | {
      ok: true
      session: Session
      adminUserId: string
    }
  | {
      ok: false
      response: NextResponse
    }

export async function requireAdminSession({
  requireAdminFeature = true,
  disabledMessage = "Admin features not enabled",
  noSessionMessage = "Unauthorized",
  forbiddenMessage = "Forbidden: Admin access required",
}: RequireAdminSessionOptions = {}): Promise<RequireAdminSessionResult> {
  if (requireAdminFeature && !isImpersonationEnabled()) {
    return {
      ok: false,
      response: NextResponse.json({ error: disabledMessage }, { status: 503 }),
    }
  }

  const session = await auth()
  const adminUserId = session?.user?.id

  if (!adminUserId) {
    return {
      ok: false,
      response: NextResponse.json({ error: noSessionMessage }, { status: 401 }),
    }
  }

  const isAdmin = await isAdminUser(adminUserId)
  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: forbiddenMessage }, { status: 403 }),
    }
  }

  return {
    ok: true,
    session,
    adminUserId,
  }
}
