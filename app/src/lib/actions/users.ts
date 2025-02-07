"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth, signIn } from "@/auth"
import {
  getUserByFarcasterId,
  searchUsersByUsername,
  updateUserDiscord,
  updateUserEmail,
  updateUserGithub,
  updateUserGovForumProfileUrl,
  updateUserHasGithub,
  updateUserInteraction,
} from "@/db/users"
import { addContactToList, updateContactEmail } from "@/lib/api/mailchimp"

const UpdateEmailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
})

export const connectDiscord = async () => {
  await signIn("discord")
}

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

  const { data, success, error } = UpdateEmailSchema.safeParse({ email })
  if (!success) {
    return {
      error,
      user: null,
    }
  }

  const { email: parsedEmail } = data

  const currentEmail = user.emails[0]?.email
  if (currentEmail) {
    await updateContactEmail({
      currentEmail,
      newEmail: parsedEmail,
    })
  } else {
    await addContactToList({
      email: parsedEmail,
    })
  }

  const [_, updated] = await updateUserEmail({
    id: user.id,
    email: parsedEmail,
  })

  revalidatePath("/dashboard")
  revalidatePath("/profile/details")
  revalidatePath("/rewards/[rewardId]/page", "page")

  console.info(
    `Email updated for user farcasterId ${session.user.farcasterId}: ${parsedEmail}`,
  )

  return {
    error: null,
    user: updated,
  }
}

export const removeDiscord = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateUserDiscord({
    id: session.user.id,
    discord: null,
  })

  revalidatePath("/dashboard")
  revalidatePath("/profile/connected-apps")

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
  revalidatePath("/profile/connected-apps")

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

  let updated = await updateUserHasGithub({
    id: session.user.id,
    notDeveloper: isNotDeveloper,
  })

  if (isNotDeveloper && !!updated.github) {
    await updateUserGithub({ id: session.user.id, github: null })
  }

  revalidatePath("/dashboard")
  revalidatePath("/profile/connected-apps")

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

  const updated = await updateUserGovForumProfileUrl({
    id: session.user.id,
    govForumProfileUrl,
  })

  revalidatePath("/profile/details")

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
