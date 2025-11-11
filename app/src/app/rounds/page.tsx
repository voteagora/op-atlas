import { Metadata } from "next"
import { redirect } from "next/navigation"

import { Rounds } from "@/components/rounds/Rounds"
import { getUserById } from "@/db/users"
import { updateInteractions } from "@/lib/actions/users"
import { withImpersonation } from "@/lib/db/sessionContext"

export const metadata: Metadata = {
  title: "Rounds - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
  openGraph: {
    title: "Rounds - OP Atlas",
  },
}
export default async function Page() {
  const { session, db, userId } = await withImpersonation()
  if (!userId) {
    return <Rounds user={null} />
  }

  const user = await getUserById(userId, db, session)

  if (!user) {
    redirect("/")
  }

  void updateInteractions({ userId, homePageViewCount: 1 })

  return <Rounds user={user} />
}
