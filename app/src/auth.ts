import { createAppClient, viemConnector } from "@farcaster/auth-client"
import { deleteCookie, getCookie } from "cookies-next"
import { cookies } from "next/headers"
import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import DiscordProvider from "next-auth/providers/discord"
import GitHubProvider from "next-auth/providers/github"

import { updateUserGithub, upsertUser } from "./db/users"
import { updateUserDiscord } from "./db/users"
import { DISCORD_REDIRECT_COOKIE, GITHUB_REDIRECT_COOKIE } from "./lib/utils"

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
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
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
        const { id, emails, farcasterId } = await upsertUser({
          farcasterId: fid.toString(),
          name: credentials?.name as string | undefined,
          username: credentials?.username as string | undefined,
          imageUrl: credentials?.pfp as string | undefined,
          bio: credentials?.bio as string | undefined,
        })

        return {
          id,
          farcasterId,
          email: emails[0]?.email,
          name: credentials?.name as string | undefined,
          image: credentials?.pfp as string | undefined,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        const discordUsername = profile?.username as string | undefined
        if (!discordUsername) {
          console.error("No Discord ID found in OAuth callback")
          return "/dashboard"
        }

        const session = await auth()
        if (!session) {
          console.error("No session found when connecting Discord profile")
          return "/"
        }

        await updateUserDiscord({
          id: session.user.id,
          discord: discordUsername,
        })

        const redirect = getCookie(DISCORD_REDIRECT_COOKIE, { cookies })
        if (redirect && redirect !== "/") {
          deleteCookie(DISCORD_REDIRECT_COOKIE, { cookies })
          return redirect
        }

        return "/dashboard"
      }
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

        // Check to see if we set a redirect
        const redirect = getCookie(GITHUB_REDIRECT_COOKIE, { cookies })
        if (redirect && redirect !== "/") {
          deleteCookie(GITHUB_REDIRECT_COOKIE, { cookies })
          return redirect
        }

        // Default to redirecting to the dashboard
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
