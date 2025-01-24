import { notFound } from "next/navigation"
import React from "react"

import Mission from "@/components/missions/details/Mission"
import { MODERN_FUNDING_ROUNDS } from "@/lib/mocks"

export default async function MissionPage({
  params,
}: {
  params: { id: string }
}) {
  const round = MODERN_FUNDING_ROUNDS.find(
    (page) => page.pageName === params.id,
  )
  if (round === undefined) notFound()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <Mission />
    </main>
  )
}
