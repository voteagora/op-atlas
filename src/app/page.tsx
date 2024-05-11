import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return <Rounds />
}
