"use server"

import { revalidatePath } from "next/cache"

import { auth, signIn } from "@/auth"
import {
  getUserByFarcasterId,
  searchUsersByUsername,
  updateUserEmail,
  updateUserGithub,
  updateUserHasGithub,
} from "@/db/users"

export const connectGithub = async () => {
  await signIn("github")
}

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

  console.info(
    `Email updated for user farcasterId ${session.user.farcasterId}: ${email}`,
  )

  return {
    error: null,
    user: updated,
  }
}

export const removeGithub = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateUserGithub({ id: session.user.id, github: null })
  revalidatePath("/dashboard")

  return {
    error: null,
    user: updated,
  }
}

export const setUserIsNotDeveloper = async (isNotDeveloper: boolean) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateUserHasGithub({
    id: session.user.id,
    notDeveloper: isNotDeveloper,
  })

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
