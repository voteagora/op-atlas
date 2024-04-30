import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createAppClient, viemConnector } from "@farcaster/auth-client"
import { upsertUser } from "./db/users"

if (!process.env.NEXT_PUBLIC_VERCEL_URL) {
  throw new Error("Please define NEXT_PUBLIC_VERCEL_URL in .env")
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      farcasterId: string
    } & DefaultSession["user"]
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
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
        username: {
          label: "Username",
          type: "text",
          placeholder: "0x0",
        },
        name: {
          label: "Name",
          type: "text",
          placeholder: "0x0",
        },
        bio: {
          label: "Bio",
          type: "text",
          placeholder: "0x0",
        },
        pfp: {
          label: "Pfp",
          type: "text",
          placeholder: "0x0",
        },
        nonce: {
          label: "Nonce",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        const appClient = createAppClient({
          ethereum: viemConnector(),
        })

        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: process.env.NEXT_PUBLIC_VERCEL_URL!,
          nonce: (credentials?.nonce as string) ?? "",
        })

        const { success, fid } = verifyResponse

        if (!success) {
          return null
        }

        // Create or update the user in our database
        const { id, email, farcasterId } = await upsertUser({
          farcasterId: fid.toString(),
          name: credentials?.name as string | undefined,
          username: credentials?.username as string | undefined,
          imageUrl: credentials?.pfp as string | undefined,
          bio: credentials?.bio as string | undefined,
        })

        return {
          id,
          email,
          farcasterId,
          name: credentials?.name as string | undefined,
          image: credentials?.pfp as string | undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore farcasterId is added above
        token.farcasterId = user?.farcasterId
        token.id = user?.id
      }

      return token
    },
    async session({ session, token }) {
      // Include the user ID in the session
      session.user.id = token.id as string
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      session.user.farcasterId = token.farcasterId
      return session
    },
  },
})
