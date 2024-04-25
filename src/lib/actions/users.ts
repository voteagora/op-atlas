"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { getUserByFarcasterId, updateUserEmail } from "@/db/users"

export const updateEmail = async (email: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserByFarcasterId(session.user.id)
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
