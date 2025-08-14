import { PrivyClient } from "@privy-io/server-auth"

let cachedClient: PrivyClient | null = null

export function getPrivy(): PrivyClient {
  if (cachedClient) return cachedClient

  const appId = process.env.PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET

  if (appId && appSecret) {
    cachedClient = new PrivyClient(appId, appSecret)
    return cachedClient
  }

  const noop = {
    verifyAuthToken: async () => ({}) as any,
  } as unknown as PrivyClient

  cachedClient = noop
  return cachedClient
}
