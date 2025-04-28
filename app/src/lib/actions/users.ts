"use server"

import { Prisma } from "@prisma/client"

import { auth } from "@/auth"
import {
  searchUsersByUsername,
  updateUser,
  updateUserInteraction
} from "@/db/users"




export const setUserIsNotDeveloper = async (isNotDeveloper: boolean) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  let updated = await updateUser({
    id: session.user.id,
    notDeveloper: isNotDeveloper,
  })

  return {
    error: null,
    user: updated,
  }
}

export const updateGovForumProfileUrl = async (govForumProfileUrl: string) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  // Validate gov forum profile URL format
  if (
    !govForumProfileUrl.match(
      /^https:\/\/gov\.optimism\.io\/u\/[^\/]+\/summary$/,
    )
  ) {
    return {
      error:
        "Invalid URL format. Must be https://gov.optimism.io/u/yourname/summary",
    }
  }

  const updated = await updateUser({
    id: session.user.id,
    govForumProfileUrl,
  })

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

export const updateInteractions = async (
  data: Prisma.UserInteractionUncheckedCreateInput,
) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const userInteraction = await updateUserInteraction(session?.user?.id, {
    ...data,
    userId: session.user.id,
  })

  return {
    error: null,
    userInteraction,
  }
}
