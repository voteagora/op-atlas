import NextAuth, { type DefaultSession } from "next-auth"

import { PrivyCredentialsProvider } from "./providers/PrivyCredentialsProvider"
import {
  isSignedImpersonationSessionValid,
  type SignedImpersonationSession,
} from "@/lib/auth/impersonationSession"

function isSignedImpersonationSession(
  value: unknown,
): value is SignedImpersonationSession {
  if (!value || typeof value !== "object") {
    return false
  }
  const session = value as Partial<SignedImpersonationSession>
  return (
    typeof session.isActive === "boolean" &&
    typeof session.adminUserId === "string" &&
    typeof session.adminAddress === "string" &&
    typeof session.targetUserId === "string" &&
    typeof session.targetUserName === "string" &&
    typeof session.startedAt === "string"
  )
}

if (!process.env.NEXT_PUBLIC_VERCEL_URL) {
  throw new Error("Please define NEXT_PUBLIC_VERCEL_URL in .env")
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      farcasterId: string
    } & DefaultSession["user"]

    // Admin impersonation metadata (signed server-side)
    impersonation?: SignedImpersonationSession | null
  }

  interface JWT {
    farcasterId?: string
    id?: string
    impersonation?: SignedImpersonationSession
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [PrivyCredentialsProvider],
  callbacks: {
    async signIn({ account }) {
      return account?.type === "credentials"
    },
    async jwt({ token, account, user, trigger, session }) {
      // Initial sign in
      if (account) {
        // @ts-ignore farcasterId is added above
        token.farcasterId = user?.farcasterId
        token.id = user?.id
      }

      // Handle session updates (including impersonation changes)
      if (trigger === "update" && session?.impersonation !== undefined) {
        if (session.impersonation === null) {
          token.impersonation = undefined
        } else {
          const adminUserId = token.id as string | undefined
          if (!adminUserId) {
            throw new Error("Missing admin user ID for impersonation")
          }

          const impersonation = session
            .impersonation as SignedImpersonationSession

          if (
            !isSignedImpersonationSessionValid(impersonation, {
              currentAdminUserId: adminUserId,
            })
          ) {
            throw new Error("Invalid impersonation payload")
          }

          token.impersonation = impersonation
        }
      }

      const adminId = token.id as string | undefined
      const impersonation = isSignedImpersonationSession(token.impersonation)
        ? token.impersonation
        : null
      if (
        impersonation &&
        !isSignedImpersonationSessionValid(impersonation, {
          currentAdminUserId: adminId,
        })
      ) {
        token.impersonation = undefined
      } else if (!impersonation) {
        token.impersonation = undefined
      }

      return token
    },
    async session({ session, token }) {
      // Include the user ID in the session
      session.user.id = token.id as string
      // @ts-ignore
      session.user.farcasterId = token.farcasterId

      // Include impersonation metadata in session
      const tokenImpersonation = isSignedImpersonationSession(
        token.impersonation,
      )
        ? token.impersonation
        : null
      if (
        tokenImpersonation &&
        isSignedImpersonationSessionValid(tokenImpersonation, {
          currentAdminUserId: token.id as string,
        })
      ) {
        session.impersonation = tokenImpersonation
      } else {
        session.impersonation = undefined
      }

      return session
    },
  },
})
