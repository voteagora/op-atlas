"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Application } from "@prisma/client"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { ProjectApplication } from "@/components/missions/application/ProjectApplication"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { submitApplications } from "@/lib/actions/applications"
import { FundingRound, ModernFundingRound } from "@/lib/mocks"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

import CircleWithCheckmark from "../../common/CircleWithGreenCheckmark"
import { Button } from "../../ui/button"
import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { MissionApplicationBreadcrumbs } from "./MissionApplicationBreadcrumbs"
import { MissionApplicationTerms } from "./MissionApplicationTerms"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { useUserRoundApplications } from "@/hooks/db/useUserRoundApplications"
import { ApplicationFormSchema } from "./MissionApplication"
import { useSession } from "next-auth/react"

export function MissionApplicationTabs({
  form,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  onSubmit: (
    email: string | null | undefined,
    projects: z.infer<typeof ApplicationFormSchema>["projects"],
  ) => void
}) {
  const round = useMissionFromPath()
  const session = useSession()

  const [currentTab, setCurrentTab] = useState("details")
  const router = useRouter()

  const { data: projects = [], isLoading } = useUserProjects(round?.number)
  const { data: applications = [] } = useUserRoundApplications(round?.number)

  useEffect(() => {
    if (projects.length > 0) {
      form.reset({
        projects: projects.map((project) => ({
          selected: false,
          projectId: project.id,
        })),
      })
    }
  }, [projects, form])

  const projectsForm = form.watch("projects")

  const isFormValid = projectsForm?.some((project) => {
    return project.selected
  })

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-96 grid-cols-2 bg-background">
        <TabsTrigger
          className={`flex justify-start data-[state=active]:bg-background data-[state=active]:shadow-none px-0`}
          value="details"
        >
          <span className="pr-2">
            {currentTab === "terms" ? (
              <div className="w-5 h-5">
                <CircleWithCheckmark />
              </div>
            ) : (
              "1"
            )}
          </span>{" "}
          Choose projects
        </TabsTrigger>
        <TabsTrigger
          className={`flex justify-start data-[state=active]:bg-background data-[state=active]:shadow-none px-0`}
          value="terms"
          disabled={!isFormValid}
        >
          <span className="pr-2">2</span> Agree to terms
        </TabsTrigger>
      </TabsList>
      <div className="mt-12">
        <TabsContent value="details">
          {projects.length > 0 ? (
            <>
              {projects.map((field, index) => (
                <ProjectApplication
                  key={field.id}
                  index={index}
                  project={field}
                  isAppliedToRound={
                    applications?.find(
                      (app) =>
                        app.project.id === field.id &&
                        app.roundId === round?.number.toString(),
                    )
                      ? true
                      : false
                  }
                  form={form}
                />
              ))}
              <Button
                className="mt-10"
                variant={"destructive"}
                disabled={!isFormValid}
                onClick={() => {
                  setCurrentTab("terms")
                }}
              >
                Next
              </Button>
            </>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-y-5 p-10 border border-2 border-grey-900 rounded-xl">
              <p className="font-bold">{"Loading your projects..."}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-5 p-10 border border-2 border-grey-900 rounded-xl">
              <p className="font-bold">
                {"You haven't added or joined any projects"}
              </p>

              <p className="text-sm text-secondary-foreground text-center">
                {
                  "To apply for this Retro Funding Mission, first add your project to OP Atlas."
                }
              </p>

              <div className="flex gap-4">
                <Button className="w-44" variant={"destructive"}>
                  Add Project
                </Button>
                <Button
                  className="w-44"
                  variant={"outline"}
                  onClick={() => {
                    router.push(`/missions/${round?.pageName}`)
                  }}
                >
                  View Mission Details
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="terms">
          <MissionApplicationTerms
            onSubmit={() => {
              onSubmit(
                session?.data?.user.email,
                form.getValues().projects.filter((project) => project.selected),
              )
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
