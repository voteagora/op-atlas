"use server"

import type { User as PrivyUser } from "@privy-io/react-auth"

import { syncPrivyUser } from "@/db/privy"
import { getUserById } from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"

export async function syncCurrentPrivyUser(privyUser: PrivyUser) {
  return withImpersonation(
    async ({ db, session, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const currentUser = await getUserById(userId, db, session)
      if (!currentUser || currentUser.privyDid !== privyUser.id) {
        throw new Error("Unauthorized")
      }

      return syncPrivyUser(privyUser)
    },
    { requireUser: true },
  )
}
