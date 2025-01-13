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
import { getAdminProjects, getRoundApplications } from "@/lib/actions/projects"
import { getCategories } from "@/db/category"
import { auth } from "@/auth"
import { Project } from "@/components/missions/Project"

export default async function Apply({ params }: { params: { id: string } }) {
  const session = await auth()

  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  const { pageName, name, applyBy, startsAt } = foundRound

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(session.user.id, "5"),
        getRoundApplications(session.user.id, 5),
        getCategories(),
      ])
    : [[], [], []]

  console.log(projects)
  console.log(applications)

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
        {" "}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Retro Funding Missions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/missions/${pageName}`}>
                {name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Apply</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col mt-10">
          <h2 className="text-4xl mb-2">{name}</h2>
          {applyBy &&
            `Submit this application by ${format(
              applyBy,
              "MMM d",
            )} to be evaluated for rewards starting 
                    ${format(startsAt, "MMM d")}.`}
          {projects.map((field, index) => (
            <Project
              key={field.id}
              index={index}
              project={field}
              round={foundRound}
            />
          ))}{" "}
        </div>
      </div>
    </main>
  )
}
