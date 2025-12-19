import crypto from "crypto"

import { isAdminWallet, isImpersonationEnabled } from "./adminConfig"

const DEFAULT_DURATION_MINUTES = 120

const sessionDurationMinutes = Number(
  process.env.ADMIN_IMPERSONATION_SESSION_MINUTES ?? DEFAULT_DURATION_MINUTES,
)

export const IMPERSONATION_SESSION_DURATION_MS = Math.max(
  5,
  sessionDurationMinutes,
) * 60 * 1000

export type ImpersonationSessionState = {
  isActive: boolean
  adminUserId: string
  adminAddress: string
  targetUserId: string
  targetUserName: string
  targetUserEmail?: string
  targetUserImage?: string
  startedAt: string
  lastSwitchedAt?: string
  issuedAt: string
  expiresAt: string
}

export type SignedImpersonationSession = ImpersonationSessionState & {
  signature: string
}

function getImpersonationSecret(): string {
  const secret =
    process.env.IMPERSONATION_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error(
      "Missing NEXTAUTH_SECRET (or IMPERSONATION_SESSION_SECRET) for admin impersonation signing.",
    )
  }

  return secret
}

function serializePayload(payload: ImpersonationSessionState): string {
  // Ensure deterministic ordering + null placeholders for optional fields
  return JSON.stringify({
    isActive: payload.isActive,
    adminUserId: payload.adminUserId,
    adminAddress: payload.adminAddress,
    targetUserId: payload.targetUserId,
    targetUserName: payload.targetUserName,
    targetUserEmail: payload.targetUserEmail ?? null,
    targetUserImage: payload.targetUserImage ?? null,
    startedAt: payload.startedAt,
    lastSwitchedAt: payload.lastSwitchedAt ?? null,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  })
}

export function signImpersonationSession(
  payload: ImpersonationSessionState,
): SignedImpersonationSession {
  if (!payload.isActive) {
    throw new Error("Cannot sign inactive impersonation sessions")
  }

  const serialized = serializePayload(payload)
  const hmac = crypto
    .createHmac("sha256", getImpersonationSecret())
    .update(serialized)
    .digest("hex")

  return {
    ...payload,
    signature: hmac,
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
}

export function verifyImpersonationSignature(
  payload: SignedImpersonationSession,
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", getImpersonationSecret())
      .update(serializePayload(stripSignature(payload)))
      .digest("hex")

    return timingSafeCompare(payload.signature, expected)
  } catch (error) {
    console.error("Failed to verify impersonation signature:", error)
    return false
  }
}

export function stripSignature(
  payload: SignedImpersonationSession,
): ImpersonationSessionState {
  const {
    signature: _signature,
    ...rest
  } = payload

  return rest
}

export function isSignedImpersonationSessionValid(
  payload: SignedImpersonationSession | null | undefined,
  options: { currentAdminUserId?: string } = {},
): payload is SignedImpersonationSession {
  if (!payload?.isActive) {
    return false
  }

  if (!isImpersonationEnabled()) {
    return false
  }

  if (!isAdminWallet(payload.adminAddress)) {
    return false
  }

  if (
    options.currentAdminUserId &&
    payload.adminUserId !== options.currentAdminUserId
  ) {
    return false
  }

  const expiresAt = Date.parse(payload.expiresAt)

  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return false
  }

  return verifyImpersonationSignature(payload)
}
