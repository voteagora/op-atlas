import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"
import { getUserById } from "@/db/users"
import { getAdminProjects, getApplications } from "@/lib/actions/projects"
import { updateInteractions } from "@/lib/actions/users"

export default async function Page() {
  const session = await auth()

  const userId = session?.user.id ?? ""

  const [user] = await Promise.all([getUserById(userId)])

  if (session?.user) {
    updateInteractions({ userId: session.user?.id, homePageViewCount: 1 })
  }

  return <Rounds user={user} />
}
