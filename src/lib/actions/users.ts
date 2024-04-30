"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  getUserByFarcasterId,
  searchUsersByUsername,
  updateUserEmail,
} from "@/db/users"

export const updateEmail = async (email: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserByFarcasterId(session.user.farcasterId)
  if (!user) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateUserEmail({ id: user.id, email })
  revalidatePath("/dashboard")

  return {
    error: null,
    user: updated,
  }
}

/**
 * Searches users by Farcaster username.
 * The query must be at least three characters long.
 */
export const searchUsers = async (username: string) => {
  // Require authentication.
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  if (username.length < 1) {
    return {
      error: null,
      users: [],
    }
  }

  const users = await searchUsersByUsername({ username })
  return {
    error: null,
    users,
  }
}
