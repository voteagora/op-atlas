import { PrivyClient } from "@privy-io/server-auth"

class Privy {
  private static instance: PrivyClient | null = null

  private constructor() {}

  public static getInstance(): PrivyClient {
    if (!Privy.instance) {
      const appId = process.env.PRIVY_APP_ID
      const appSecret = process.env.PRIVY_APP_SECRET

      if (!appId || !appSecret) {
        throw new Error(
          "Please define PRIVY_APP_ID and PRIVY_APP_SECRET in .env",
        )
      }

      Privy.instance = new PrivyClient(appId, appSecret)
    }
    return Privy.instance
  }
}

const privy = Privy.getInstance()
export default privy
