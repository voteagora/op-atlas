import { auth } from "@/auth"
import { Rounds } from "@/components/rounds/Rounds"
import { getUserById } from "@/db/users"
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
