import { notFound, redirect } from "next/navigation"
import React from "react"

import { MissionApplication } from "@/components/missions/application/MissionApplication"
import { MISSIONS } from "@/lib/MissionsAndRoundData"
import { auth } from "@/auth"

export default async function MissionApplicationPage({
  params,
}: {
  params: { id: string }
}) {
  const round = MISSIONS.find((page) => page.pageName === params.id)
  if (!round) notFound()

  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <MissionApplication userId={userId} />
    </main>
  )
}
