import { redirect } from "next/navigation"

import { getRandomProjects } from "@/app/api/db/projects"
import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"

export default async function Home() {
  const [session, projects] = await Promise.all([auth(), getRandomProjects()])

  if (session?.user) {
    redirect("/dashboard")
  }

  return <Rounds projects={projects} />
}
