"use client"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import ExtendedLink from "@/components/common/ExtendedLink"
import { ProjectApplication } from "@/components/missions/application/ProjectApplication"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSessionAdminProjects } from "@/hooks/db/useAdminProjects"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useSessionRoundApplications } from "@/hooks/db/useUserRoundApplications"

import CircleWithCheckmark from "../../common/CircleWithGreenCheckmark"
import { Button } from "../../ui/button"
import { ApplicationFormSchema } from "./MissionApplication"
import { MissionApplicationTerms } from "./MissionApplicationTerms"

export function MissionApplicationTabs({
  form,
  isSubmitting,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  isSubmitting: boolean
  onSubmit: () => void
}) {
  const mission = useMissionFromPath()
  const session = useSession()

  const [currentTab, setCurrentTab] = useState("details")
  const router = useRouter()

  const { data: projects = [], isLoading: isLoadingProjects } =
    useSessionAdminProjects()
  const { data: applications = [], isLoading: isLoadingApplications } =
    useSessionRoundApplications(mission?.number)

  useEffect(() => {
    if (projects.length > 0) {
      form.setValue(
        "projects",
        projects.map((project) => ({
          selected: false,
          projectId: project.id,
          category: "",
          projectDescriptionOptions: [],
          impactStatement: {},
        })),
      )
    }
  }, [projects, form])

  const projectsForm = form.watch("projects")

  const isFormValid = projectsForm?.some((project) => {
    return project.selected
  })

  const isOpenForEnrollment = mission && mission?.startsAt < new Date()

  const viewMissionDetailsBtn = (
    <Button
      className="w-44"
      variant={"outline"}
      onClick={() => {
        router.push(`/missions/${mission?.pageName}`)
      }}
    >
      View Mission Details
    </Button>
  )

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-80 grid-cols-2 bg-background">
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
          disabled={!isFormValid || isLoadingApplications}
        >
          <span className="pr-2">2</span> Agree to terms
        </TabsTrigger>
      </TabsList>
      <div className="mt-12">
        <TabsContent value="details">
          <p className="text-2xl font-bold mb-5">Choose projects</p>

          {!isOpenForEnrollment && (
            <div className="flex flex-col items-center justify-center gap-y-5 p-10 border border-2 border-grey-900 rounded-xl">
              <p className="font-bold">
                {"Not open for enrollment-coming soon"}
              </p>
              {viewMissionDetailsBtn}
            </div>
          )}

          {isOpenForEnrollment && (
            <>
              {projects.length > 0 ? (
                <>
                  {projects.map((field, index) => (
                    <ProjectApplication
                      key={field.id}
                      index={index}
                      project={field}
                      isAppliedToRound={
                        !!applications?.find(
                          (app) =>
                            app.project.id === field.id &&
                            app.roundId === mission?.number.toString(),
                        )
                      }
                      form={form}
                    />
                  ))}
                  <Button
                    className="mt-10"
                    variant={"destructive"}
                    disabled={!isFormValid || isLoadingApplications}
                    onClick={() => {
                      setCurrentTab("terms")
                    }}
                  >
                    Next
                  </Button>
                </>
              ) : isLoadingProjects ? (
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
                    <ExtendedLink
                      as="button"
                      href="/projects/new"
                      text="Add Project"
                      variant="primary"
                      className="w-full"
                    />
                    {viewMissionDetailsBtn}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="terms">
          <MissionApplicationTerms
            isSubmitting={isSubmitting}
            onSubmit={() => onSubmit()}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
