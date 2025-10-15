import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
const TOKEN_EXPIRY_DAYS = 7

if (!JWT_SECRET) {
  console.warn("JWT_SECRET or NEXTAUTH_SECRET not configured for KYC tokens")
}

export type KYCTokenPayload = {
  entityType: "kycUser" | "legalEntity"
  entityId: string
  email: string
  createdAt: number
}

/**
 * Generate a secure token for KYC verification
 * Token is valid for 7 days
 */
export async function generateKYCToken(
  entityType: "kycUser" | "legalEntity",
  entityId: string,
  email: string,
): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured")
  }

  const secret = new TextEncoder().encode(JWT_SECRET)
  const payload: KYCTokenPayload = {
    entityType,
    entityId,
    email,
    createdAt: Date.now(),
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_DAYS}d`)
    .setSubject(entityId)
    .sign(secret)

  return token
}

/**
 * Verify and decode a KYC token
 * Returns null if token is invalid or expired
 */
export async function verifyKYCToken(
  token: string,
): Promise<KYCTokenPayload | null> {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured")
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      entityType: payload.entityType as "kycUser" | "legalEntity",
      entityId: payload.entityId as string,
      email: payload.email as string,
      createdAt: payload.createdAt as number,
    }
  } catch (error) {
    console.error("Failed to verify KYC token:", error)
    return null
  }
}

/**
 * Check if a KYC inquiry has expired (older than 7 days from creation)
 */
export function isKYCLinkExpired(createdAt: Date): boolean {
  const expiryDate = new Date(createdAt)
  expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS)
  return new Date() > expiryDate
}
