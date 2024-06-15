import { createAppClient, viemConnector } from "@farcaster/auth-client"
import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"

import { updateUserGithub, upsertUser } from "./db/users"

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
    GitHub,
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

        const farcasterDomain =
          process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
            ? process.env.NEXT_PUBLIC_APP_DOMAIN
            : process.env.NEXT_PUBLIC_VERCEL_URL

        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: farcasterDomain!,
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
    async signIn({ user, account, profile, email, credentials }) {
      // If we're authenticating via GitHub OAuth, link the handle to the existing session
      if (account?.provider === "github") {
        const handle = profile?.login as string | undefined
        if (!handle) {
          console.error("No GitHub handle found in OAuth callback")
          return "/dashboard"
        }

        const session = await auth()
        if (!session) {
          // Should never happen
          console.error("No session found when connecting GitHub profile")
          return "/"
        }

        await updateUserGithub({
          id: session.user.id,
          github: handle,
        })

        // Proceed to the dashboard
        return "/dashboard"
      }

      // // Only farcaster accounts can actually sign in
      return account?.type === "credentials"
    },
    async jwt({ token, account, user, trigger, session }) {
      if (account) {
        // @ts-ignore farcasterId is added above
        token.farcasterId = user?.farcasterId
        token.id = user?.id
      }

      if (trigger === "update" && session?.email) {
        token.email = session.email
      }

      return token
    },
    async session({ session, token, trigger }) {
      // Include the user ID in the session
      session.user.id = token.id as string
      // @ts-ignore
      session.user.farcasterId = token.farcasterId

      if (trigger == "update" && token?.email) {
        session.user.email = token.email
      }
      return session
    },
  },
})
