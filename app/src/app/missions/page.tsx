import { Metadata } from "next"

import { auth } from "@/auth"
import { Rounds } from "@/components/rounds/Rounds"
import { getUserById } from "@/db/users"
import { updateInteractions } from "@/lib/actions/users"

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
  const session = await auth()

  const userId = session?.user.id ?? ""
  const [user] = await Promise.all([getUserById(userId)])

  if (session?.user) {
    updateInteractions({ userId: session.user?.id, homePageViewCount: 1 })
  }

  return <Rounds user={user} />
}
