"use server"

import { auth } from "@/auth"
import { makeUserAddressPrimary } from "@/db/users"

export async function makeUserAddressPrimaryAction(address: string) {
  const session = await auth()
  if (!session?.user) {
    return
  }

  await makeUserAddressPrimary(address, session.user.id)
}
