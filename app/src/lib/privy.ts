let cachedClient: any | null = null

export async function getPrivy(): Promise<any> {
  if (cachedClient) return cachedClient

  // In E2E or when no credentials, use no-op to avoid server-auth in Edge
  if (process.env.NEXT_PUBLIC_E2E === "true") {
    const noop = { verifyAuthToken: async () => ({} as any) }
    cachedClient = noop
    return cachedClient
  }

  const appId = process.env.PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET

  if (appId && appSecret) {
    const isEdge = process.env.NEXT_RUNTIME === "edge"
    if (isEdge) {
      const noop = { verifyAuthToken: async () => ({} as any) }
      cachedClient = noop
      return cachedClient
    }
    const { PrivyClient } = await import("@privy-io/server-auth")
    cachedClient = new PrivyClient(appId, appSecret)
    return cachedClient
  }

  const noop = { verifyAuthToken: async () => ({} as any) }
  cachedClient = noop
  return cachedClient
}
