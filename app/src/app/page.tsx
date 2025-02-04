import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Rounds } from "@/components/home/Rounds"
import { getRandomProjects } from "@/db/projects"
import { getApplications } from "@/lib/actions/projects"

import { sharedMetadata } from "./shared-metadata"

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Homepage - OP Atlas",
  description:
    "OP Atlas is the home of Optimism Contributors. Discover Retro Funding, grants and governance opportunities on the Superchain.",
  openGraph: {
    ...sharedMetadata.openGraph,
    title: "Homepage - OP Atlas",
    description:
      "OP Atlas is the home of Optimism Contributors. Discover Retro Funding, grants and governance opportunities on the Superchain.",
  },
}

export default async function Home() {
  const [session] = await Promise.all([auth()])

  if (session?.user) {
    redirect("/dashboard")
  }

  return <Rounds />
}
