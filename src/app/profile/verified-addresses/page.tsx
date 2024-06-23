import { redirect } from "next/navigation"
import { toast } from "sonner"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { getUserById } from "@/db/users"
import { useAppDialogs } from "@/providers/DialogProvider"

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
