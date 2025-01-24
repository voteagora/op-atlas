import { notFound } from "next/navigation"
import React from "react"

import { auth } from "@/auth"
import { MissionApplication } from "@/components/missions/application/MissionApplication"
import { MODERN_FUNDING_ROUNDS } from "@/lib/mocks"

export default async function MissionApplicationPage({
  params,
}: {
  params: { id: string }
}) {
  const round = MODERN_FUNDING_ROUNDS.find(
    (page) => page.pageName === params.id,
  )
  if (round === undefined) notFound()

  const session = await auth()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <MissionApplication />
    </main>
  )
}
