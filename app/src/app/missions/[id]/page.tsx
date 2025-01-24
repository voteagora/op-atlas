import { notFound } from "next/navigation"
import React from "react"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import Mission from "@/components/missions/details/Mission"

export default async function MissionPage({
  params,
}: {
  params: { id: string }
}) {
  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <Mission round={foundRound} />
    </main>
  )
}
