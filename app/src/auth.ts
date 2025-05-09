import NextAuth, { type DefaultSession } from "next-auth"

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
  providers: [PrivyCredentialsProvider],
  callbacks: {
    async signIn({ account }) {
      return account?.type === "credentials"
    },
    async jwt({ token, account, user, trigger, session }) {
      if (account) {
        // @ts-ignore farcasterId is added above
        token.farcasterId = user?.farcasterId
        token.id = user?.id
      }

      return token
    },
    async session({ session, token, trigger }) {
      // Include the user ID in the session
      session.user.id = token.id as string
      // @ts-ignore
      session.user.farcasterId = token.farcasterId

      return session
    },
  },
})
