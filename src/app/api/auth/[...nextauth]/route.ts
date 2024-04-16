import { createAppClient, viemConnector } from "@farcaster/auth-client"
import NextAuth from "next-auth"

import CredentialsProvider from "next-auth/providers/credentials"

if (!process.env.NEXT_PUBLIC_APP_DOMAIN) {
  throw new Error("Please define NEXT_PUBLIC_APP_DOMAIN in .env")
}

export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Sign in with Farcaster",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        // In a production app with a server, these should be fetched from
        // your Farcaster data indexer rather than have them accepted as part
        // of credentials.
        name: {
          label: "Name",
          type: "text",
          placeholder: "0x0",
        },
        pfp: {
          label: "Pfp",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials: any) {
        const appClient = createAppClient({
          ethereum: viemConnector(),
        })

        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: process.env.NEXT_PUBLIC_APP_DOMAIN!,
          nonce: credentials?.nonce,
        })
        const { success, fid } = verifyResponse

        if (!success) {
          return null
        }

        return {
          id: fid.toString(),
          name: credentials?.name,
          image: credentials?.pfp,
        }
      },
    }),
  ],
})

export { handler as GET, handler as POST }
