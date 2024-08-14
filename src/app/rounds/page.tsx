import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"

export default async function Page() {
  const projects = await getRandomProjects()
  return <Rounds projects={projects} />
}
