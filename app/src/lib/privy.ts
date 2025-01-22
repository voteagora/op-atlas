// NOTE: Added this implementation as we might need it in future. Not needed for now.
import { PrivyClient } from "@privy-io/server-auth"

class Privy {
  private static instance: PrivyClient

  private constructor() {
    Privy.instance = Privy.initPrivy()
  }

  public static getInstance(): PrivyClient {
    if (!Privy.instance) {
      Privy.instance = Privy.initPrivy()
    }
    return Privy.instance
  }

  private static initPrivy() {
    const appId = process.env.PRIVY_APP_ID
    const appSecret = process.env.PRIVY_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error("Please define PRIVY_APP_ID and PRIVY_APP_SECRET in .env")
    }

    return new PrivyClient(appId, appSecret)
  }
}

const privy = Privy.getInstance()
export default privy
