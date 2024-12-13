import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"

export default async function Home() {
  const [session, projects] = await Promise.all([auth(), getRandomProjects()])

  if (session?.user) {
    redirect("/dashboard")
  }

  return <Rounds projects={projects} />
}
