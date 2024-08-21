import { getRandomProjects } from "@/app/api/db/projects"
import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getUser, updateInteractions } from "@/lib/actions/users"

export default async function Page() {
  const session = await auth()
  const [projects, user] = await Promise.all([
    getRandomProjects(),
    session?.user.id ? getUser(session.user.id) : null,
  ])

  if (session?.user) {
    updateInteractions({ userId: session.user?.id, homePageViewCount: 1 })
  }

  return <Rounds projects={projects} user={user} />
}
