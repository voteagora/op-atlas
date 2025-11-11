import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import React from "react"

import { sharedMetadata } from "@/app/shared-metadata"
import { MissionApplication } from "@/components/missions/application/MissionApplication"
import { MISSIONS } from "@/lib/MissionsAndRoundData"
import { withImpersonation } from "@/lib/db/sessionContext"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const mission = MISSIONS.find((page) => page.pageName === params.id)

  return {
    ...sharedMetadata,
    title: `Retro Funding: ${mission?.name ?? ""} | Application - OP Atlas`,
    description: mission?.ogDescription,
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `Retro Funding: ${mission?.name ?? ""} | Application - OP Atlas`,
      description: mission?.ogDescription,
    },
  }
}

export default async function MissionApplicationPage({
  params,
}: {
  params: { id: string }
}) {
  const round = MISSIONS.find((page) => page.pageName === params.id)
  if (!round) notFound()

  const { userId } = await withImpersonation()

  if (!userId) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <MissionApplication userId={userId} />
    </main>
  )
}
