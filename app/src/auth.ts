import { deleteCookie, getCookie } from "cookies-next"
import NextAuth, { type DefaultSession } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import GitHubProvider from "next-auth/providers/github"
import { cookies } from "next/headers"

import { updateUserDiscord, updateUserGithub } from "./db/users"
import { DISCORD_REDIRECT_COOKIE, GITHUB_REDIRECT_COOKIE } from "./lib/utils"
import { PrivyCredentialsProvider } from "./providers/PrivyCredentialsProvider"

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
    PrivyCredentialsProvider,
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

      // // Only credentials provider supports sign in
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
