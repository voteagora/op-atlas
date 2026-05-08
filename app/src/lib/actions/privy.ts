"use server"

import type { User as PrivyUser } from "@privy-io/react-auth"

import { revalidatePath } from "next/cache"

import { syncPrivyUser } from "@/db/privy"
import { getUserById, updateUser } from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"
import { getFarcasterProfile } from "@/lib/neynar"

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

export async function refreshCurrentUserFarcasterProfile() {
  return withImpersonation(
    async ({ db, session, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const currentUser = await getUserById(userId, db, session)
      if (!currentUser) {
        throw new Error("User not found")
      }

      if (!currentUser.farcasterId) {
        throw new Error("No Farcaster account connected")
      }

      const farcasterProfile = await getFarcasterProfile(
        currentUser.farcasterId,
      )
      if (!farcasterProfile) {
        throw new Error("Farcaster profile not found")
      }

      const updated = await updateUser(
        {
          id: currentUser.id,
          name: farcasterProfile.name,
          username: farcasterProfile.username,
          imageUrl: farcasterProfile.imageUrl,
          bio: farcasterProfile.bio,
        },
        db,
      )

      const pathsToRevalidate = new Set(["/dashboard", "/profile/details"])
      if (currentUser.username) {
        pathsToRevalidate.add(`/${currentUser.username}`)
      }
      if (updated.username) {
        pathsToRevalidate.add(`/${updated.username}`)
      }

      pathsToRevalidate.forEach((path) => {
        revalidatePath(path)
      })

      return {
        user: {
          id: updated.id,
          name: updated.name,
          username: updated.username,
          imageUrl: updated.imageUrl,
          bio: updated.bio,
        },
      }
    },
    { requireUser: true },
  )
}
