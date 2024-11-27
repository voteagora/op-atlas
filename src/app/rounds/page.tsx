import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"
import { getUserById } from "@/db/users"
import { getAdminProjects } from "@/lib/actions/projects"
import { updateInteractions } from "@/lib/actions/users"

export default async function Page() {
  const session = await auth()
  const [projects, user, userProjects] = await Promise.all([
    getRandomProjects(),
    session?.user.id ? getUserById(session.user.id) : null,
    session?.user.id ? getAdminProjects(session.user.id) : null,
  ])

  if (session?.user) {
    updateInteractions({ userId: session.user?.id, homePageViewCount: 1 })
  }

  return <Rounds projects={projects} user={user} userProjects={userProjects} />
}
