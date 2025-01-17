import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  getAdminProjects,
  getApplications,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { getCategories } from "@/db/category"
import { auth } from "@/auth"
import { ApplyDetails } from "@/components/missions/ApplyDetails"
import { getProjectContracts } from "@/db/projects"

export default async function Apply({ params }: { params: { id: string } }) {
  const session = await auth()

  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  const [projects, applications] = session
    ? await Promise.all([
        getProjects(session.user.id),
        getApplications(session.user.id),
      ])
    : [[], [], []]

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <ApplyDetails
        projects={projects}
        round={foundRound}
        applications={applications}
      />
    </main>
  )
}
