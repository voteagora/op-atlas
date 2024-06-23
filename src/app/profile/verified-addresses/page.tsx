import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getUserById } from "@/db/users"

import { VerifiedAddressesContent } from "./content"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/")
  }

  return <VerifiedAddressesContent user={user} />
}
