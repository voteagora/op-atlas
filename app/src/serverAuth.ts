import { createHash } from "crypto"
import { NextRequest } from "next/server"

import { getApiUser } from "./db/apiUser"

const HASH_FN = "sha256"

type AuthInfo = {
  // change name of this field, as it's currently a misnomer; or at least tri-valued
  authenticated: boolean
  name?: string
  userId?: string
  failReason?: string
}

// Note: this is not included in lib/middleware/auth.ts since that file will be
// used in a non-node environment. This file is only intended to be used in/on node.
export async function authenticateApiUser(
  request: NextRequest,
): Promise<AuthInfo> {
  const authHeader = request.headers.get("Authorization")
  const key = authHeader?.replace("Bearer ", "")

  if (!key) {
    return {
      authenticated: false,
      failReason: "Unauthorized: No api key provided",
    }
  }

  const apiUser = await getApiUser({ apiKey: hashApiKey(key) })

  if (!apiUser) {
    return {
      authenticated: false,
      failReason: "Unauthorized: Invalid api key token",
    }
  } else if (!apiUser.enabled) {
    return {
      authenticated: false,
      failReason: "Unauthorized: Api key is disabled",
    }
  }

  return {
    authenticated: true,
    name: apiUser.name,
    userId: apiUser.id,
  }
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN)
  hash.update(apiKey)
  return hash.digest("hex")
}
