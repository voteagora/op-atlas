import { Metadata } from "next"

import { Home } from "@/components/home/Home"

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

export default async function Page() {
  return <Home />
}
