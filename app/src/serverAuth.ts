import { createHash } from "crypto"
import type { ApiUser } from "@prisma/client"
import type { NextRequest } from "next/server"

import { getApiUser } from "./db/apiUser"

const HASH_FN = "sha256"

export const API_USER_SCOPE = {
  projectsCreate: "projects:create",
  projectsDelete: "projects:delete",
  projectMetadataRead: "project-metadata:read",
  projectMetadataWrite: "project-metadata:write",
  rewardsRead: "rewards:read",
  claimsWrite: "claims:write",
} as const

export type ApiUserScope = (typeof API_USER_SCOPE)[keyof typeof API_USER_SCOPE]

type ApiUserScopeRules = {
  default?: ApiUserScope[]
  byId?: Record<string, ApiUserScope[]>
  byName?: Record<string, ApiUserScope[]>
}

type AuthenticateApiUserOptions = {
  requiredScopes?: ApiUserScope[]
  scopeRulesRaw?: string
}

const VALID_API_USER_SCOPES = new Set<ApiUserScope>(
  Object.values(API_USER_SCOPE),
)

const DEFAULT_API_USER_SCOPES: ApiUserScope[] = [
  API_USER_SCOPE.projectMetadataRead,
  API_USER_SCOPE.rewardsRead,
]

type AuthInfo = {
  // change name of this field, as it's currently a misnomer; or at least tri-valued
  authenticated: boolean
  name?: string
  userId?: string
  scopes?: ApiUserScope[]
  failReason?: string
  status?: number
}

function normalizeScopeList(scopes: unknown): ApiUserScope[] {
  if (!Array.isArray(scopes)) {
    return []
  }

  return scopes.filter((scope): scope is ApiUserScope =>
    VALID_API_USER_SCOPES.has(scope as ApiUserScope),
  )
}

export function parseApiUserScopeRules(
  raw: string | undefined,
): Required<ApiUserScopeRules> {
  if (!raw) {
    return {
      default: [...DEFAULT_API_USER_SCOPES],
      byId: {},
      byName: {},
    }
  }

  try {
    const parsed = JSON.parse(raw) as ApiUserScopeRules
    const byId = Object.fromEntries(
      Object.entries(parsed.byId ?? {}).map(([id, scopes]) => [
        id.trim().toLowerCase(),
        normalizeScopeList(scopes),
      ]),
    )
    const byName = Object.fromEntries(
      Object.entries(parsed.byName ?? {}).map(([name, scopes]) => [
        name.trim().toLowerCase(),
        normalizeScopeList(scopes),
      ]),
    )

    return {
      default: normalizeScopeList(parsed.default).length
        ? normalizeScopeList(parsed.default)
        : [...DEFAULT_API_USER_SCOPES],
      byId,
      byName,
    }
  } catch (error) {
    console.error(
      "Invalid API_KEY_SCOPE_RULES_JSON; using safe defaults",
      error,
    )
    return {
      default: [...DEFAULT_API_USER_SCOPES],
      byId: {},
      byName: {},
    }
  }
}

export function resolveApiUserScopes(
  apiUser: Pick<ApiUser, "id" | "name">,
  rules: Required<ApiUserScopeRules>,
): ApiUserScope[] {
  const resolved = new Set<ApiUserScope>(rules.default)
  const byIdScopes = rules.byId[apiUser.id.trim().toLowerCase()] ?? []
  const byNameScopes = rules.byName[apiUser.name.trim().toLowerCase()] ?? []

  for (const scope of [...byIdScopes, ...byNameScopes]) {
    resolved.add(scope)
  }

  return Array.from(resolved)
}

export function hasRequiredApiUserScopes(
  grantedScopes: ApiUserScope[],
  requiredScopes: ApiUserScope[],
): boolean {
  if (requiredScopes.length === 0) {
    return true
  }

  const granted = new Set(grantedScopes)
  return requiredScopes.every((scope) => granted.has(scope))
}

// Note: this is not included in lib/middleware/auth.ts since that file will be
// used in a non-node environment. This file is only intended to be used in/on node.
export async function authenticateApiUser(
  request: Pick<NextRequest, "headers">,
  options: AuthenticateApiUserOptions = {},
): Promise<AuthInfo> {
  const authHeader = request.headers.get("Authorization")
  const key = authHeader?.replace("Bearer ", "")

  if (!key) {
    return {
      authenticated: false,
      failReason: "Unauthorized: No api key provided",
      status: 401,
    }
  }

  // Query the authoritative production database directly
  const apiUser = await getApiUser({ apiKey: hashApiKey(key) })

  if (!apiUser) {
    return {
      authenticated: false,
      failReason: "Unauthorized: Invalid api key token",
      status: 401,
    }
  } else if (!apiUser.enabled) {
    return {
      authenticated: false,
      failReason: "Unauthorized: Api key is disabled",
      status: 401,
    }
  }

  const requiredScopes = options.requiredScopes ?? []
  const scopeRules = parseApiUserScopeRules(
    options.scopeRulesRaw ?? process.env.API_KEY_SCOPE_RULES_JSON,
  )
  const scopes = resolveApiUserScopes(apiUser, scopeRules)

  if (!hasRequiredApiUserScopes(scopes, requiredScopes)) {
    return {
      authenticated: false,
      name: apiUser.name,
      userId: apiUser.id,
      scopes,
      failReason: `Forbidden: Api key lacks required scopes (${requiredScopes.join(
        ", ",
      )})`,
      status: 403,
    }
  }

  return {
    authenticated: true,
    name: apiUser.name,
    userId: apiUser.id,
    scopes,
  }
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN)
  hash.update(apiKey)
  return hash.digest("hex")
}
