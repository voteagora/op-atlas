import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"
import { getApplications } from "@/lib/actions/projects"

export default async function Home() {
  const [session] = await Promise.all([auth()])

  if (session?.user) {
    redirect("/dashboard")
  }

  return <Rounds />
}
