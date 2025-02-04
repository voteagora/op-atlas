import { Metadata } from "next"

import { Results } from "@/components/round/results"

import { sharedMetadata } from "../../shared-metadata"

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Retro Funding Recipients - OP Atlas",
  description:
    "Explore projects on the Superchain that have received Optimism Retro Funding. Sign in to OP Atlas to learn about grant sizes, project info, and more.",
  openGraph: {
    ...sharedMetadata.openGraph,
    title: "Retro Funding Recipients - OP Atlas",
    description:
      "Explore projects on the Superchain that have received Optimism Retro Funding. Sign in to OP Atlas to learn about grant sizes, project info, and more.",
  },
}

export default function Page() {
  return <Results />
}
