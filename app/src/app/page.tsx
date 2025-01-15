import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"
import { getApplications } from "@/lib/actions/projects"

export default async function Home() {
  const [session, projects] = await Promise.all([auth(), getRandomProjects()])

  if (session?.user) {
    redirect("/dashboard")
  }

  let applications = null

  if (session?.user) applications = await getApplications(session?.user?.id)

  return <Rounds projects={projects} applications={applications} />
}
