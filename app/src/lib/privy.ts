let cachedClient: any | null = null

export function getPrivy(): any {
  if (cachedClient) return cachedClient

  const appId = process.env.PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET

  // In E2E, always return no-op to avoid importing server-auth in Edge
  if (process.env.NEXT_PUBLIC_E2E === "true") {
    const noop = {
      verifyAuthToken: async () => ({}) as any,
    }
    cachedClient = noop
    return cachedClient
  }

  if (appId && appSecret) {
    // Dynamic require so bundlers don't include this in Edge code paths
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrivyClient } = require("@privy-io/server-auth")
    cachedClient = new PrivyClient(appId, appSecret)
    return cachedClient
  }

  const noop = {
    verifyAuthToken: async () => ({}) as any,
  }

  cachedClient = noop
  return cachedClient
}
