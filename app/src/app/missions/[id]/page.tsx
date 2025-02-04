import { Metadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

import { sharedMetadata } from "@/app/shared-metadata"
import Mission from "@/components/missions/details/Mission"
import { MISSIONS } from "@/lib/MissionsAndRoundData"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const mission = MISSIONS.find((page) => page.pageName === params.id)

  return {
    ...sharedMetadata,
    title: `Retro Funding: ${mission?.name ?? ""} - OP Atlas`,
    description:
      mission?.pageName === "dev-tooling"
        ? "Retro Funding: Dev Tooling is distributing up to 8M OP in H1 2025. If you built tooling on Optimism, sign up to check if you qualify for grants"
        : "Retro Funding: Onchain Builders is allocating up to 8M OP in H1 2025. If you've built on Optimism, sign up to see if you qualify for grants.",
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `Retro Funding: ${mission?.name ?? ""} - OP Atlas`,
      description:
        mission?.pageName === "dev-tooling"
          ? "Retro Funding: Dev Tooling is distributing up to 8M OP in H1 2025. If you built tooling on Optimism, sign up to check if you qualify for grants"
          : "Retro Funding: Onchain Builders is allocating up to 8M OP in H1 2025. If you've built on Optimism, sign up to see if you qualify for grants.",
    },
  }
}

export default async function MissionPage({
  params,
}: {
  params: { id: string }
}) {
  const round = MISSIONS.find((page) => page.pageName === params.id)
  if (round === undefined) notFound()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-20 relative">
      <Mission />
    </main>
  )
}
