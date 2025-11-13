import { Metadata } from "next"
import { redirect } from "next/navigation"

import { Rounds } from "@/components/rounds/Rounds"
import { getUserById } from "@/db/users"
import { updateInteractions } from "@/lib/actions/users"
import { getImpersonationContext } from "@/lib/db/sessionContext"

import { sharedMetadata } from "../shared-metadata"

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Retro Funding Missions - OP Atlas",
  description:
    "Discover all grants for the Superchain. Sign up on OP Atlas to apply for Optimism missions, Retro Funding, and more.",
  openGraph: {
    ...sharedMetadata.openGraph,
    title: "Retro Funding Missions - OP Atlas",
    description:
      "Discover all grants for the Superchain. Sign up on OP Atlas to apply for Optimism missions, Retro Funding, and more.",
  },
}

export default async function Page() {
  const { session, db, userId } = await getImpersonationContext()
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
