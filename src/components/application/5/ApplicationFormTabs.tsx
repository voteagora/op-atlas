"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Application } from "@prisma/client"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { submitApplications } from "@/lib/actions/applications"
import {
  ApplicationWithDetails,
  CategoryWithImpact,
  ProjectWithDetails,
} from "@/lib/types"
import { getProjectStatus } from "@/lib/utils"

import ApplicationDetails from "./ApplicationDetails"
import ApplicationProjectImpact from "./ApplicationProjectImpact"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are distributed must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that no member of the team receiving the grant is a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, Belarus, the Democratic Republic of Congo, Iran, North Korea, the Russian Federation, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that the potential beneficiary of the grant is not barred from participating in Optimism's grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

const createImpactStatementSchemas = (categories: CategoryWithImpact[]) => {
  return categories.reduce((acc: Record<string, any>, category) => {
    const impactStatementShape = category.impactStatements.reduce(
      (statementAcc, statement) => {
        statementAcc[statement.id] = z
          .string()
          .min(1, "This field is required")
          .max(1000, "This field is too long")
        return statementAcc
      },
      {} as Record<string, any>,
    )
    acc[category.id] = z.object(impactStatementShape)
    return acc
  }, {})
}

const ApplicationFormTabs = ({
  projects,
  applications,
  onApplied,
  categories,
}: {
  projects?: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  onApplied: (application: ApplicationWithDetails) => void
  categories: CategoryWithImpact[]
}) => {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") || "details",
  )
  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length + 1 }, () => false),
  )
  const impactStatementSchemas = useMemo(
    () => createImpactStatementSchemas(categories),
    [categories],
  )

  const completedProjects = useMemo(() => {
    return projects?.filter((project) => {
      return getProjectStatus(project).progressPercent === 100
    })
  }, [projects])

  const ApplicationFormSchema = z.object({
    projects: z.array(
      z.object({
        projectId: z.string(),
        selected: z.boolean(),
        projectDescription: z
          .string()
          .min(1, "You need to select a one option"),
        category: z.string(),
        additionalInfo: z.string().optional(),
        impactStatement: z.union([
          impactStatementSchemas["1"],
          impactStatementSchemas["2"],
          impactStatementSchemas["3"],
        ]),
      }),
    ),
  })

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      projects: completedProjects?.map((project) => {
        const application = applications[0]?.projects.find(
          (p) => p.projectId === project.id,
        )
        return {
          projectId: project.id,
          category: application?.categoryId ?? "",
          projectDescription: application?.projectDescriptionOption ?? "",
          impactStatement: application?.impactStatementAnswers.reduce(
            (acc: Record<string, any>, statement) => {
              acc[statement.impactStatementId] = statement.answer
              return acc
            },
            {},
          ),
          selected:
            applications[0]?.projects.some((p) => p.projectId === project.id) ||
            false,
        }
      }),
    },
  })

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  const hasSelectedProjects = form
    .watch("projects")
    .some(
      (project) =>
        project.selected &&
        !applications[0]?.projects.some(
          (p) => p.projectId === project.projectId,
        ),
    )

  console.log("hasSelectedProjects", hasSelectedProjects)

  const submitApplication = async () => {
    setIsLoading(true)

    const filterProjects = form
      .getValues()
      .projects.filter(
        (project) =>
          project.selected &&
          !applications[0]?.projects.some(
            (p) => p.projectId === project.projectId,
          ),
      )

    const promise: Promise<Application> = new Promise(
      async (resolve, reject) => {
        try {
          const result = await submitApplications(
            filterProjects.map((project) => ({
              categoryId: project.category,
              projectId: project.projectId,
              projectDescriptionOption: project.projectDescription,
              impactStatement: project.impactStatement,
            })),
            applications[0]?.id,
          )

          if (result.error !== null || result.applications.length === 0) {
            throw new Error(result.error ?? "Error submitting application")
          }

          resolve(result.applications[0])
        } catch (error) {
          console.error("Error submitting application", error)
          reject(error)
        }
      },
    )

    toast.promise(promise, {
      loading: "Submitting application...",
      success: (application) => {
        onApplied(application as ApplicationWithDetails)
        return "Application submitted"
      },
      error: (error) => {
        setIsLoading(false)
        return error.message
      },
    })
  }

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setCurrentTab(tab || "details")
    }
  }, [searchParams])

  const canSubmitForm = agreedTerms.every((term) => term)
  return (
    <Form {...form}>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="projects">Projects and impact</TabsTrigger>
          <TabsTrigger value="application">Submit application</TabsTrigger>
        </TabsList>
        <div className="mt-12">
          {/* application details content */}
          <TabsContent value="details">
            <ApplicationDetails />
          </TabsContent>

          {/* project and impact content */}
          <TabsContent value="projects">
            <ApplicationProjectImpact
              onSave={() => {
                form.trigger("projects")
                setCurrentTab("application")
              }}
              projects={completedProjects}
              applications={applications}
              categories={categories}
              form={form}
            />
          </TabsContent>

          {/* submit application content */}
          <TabsContent value="application">
            <div className="flex flex-col gap-y-6 ">
              <h3>Agree and submit your application</h3>
              <p className="my-2">
                Optimism will issue an onchain attestation on your behalf when
                you submit this application. You can make edits and resubmit
                this application until the deadline (Sep 5 at 19:00 UTC).{" "}
              </p>

              <div className="flex flex-col gap-y-4 ml-px">
                {TERMS.map((term, idx) => (
                  <div key={idx} className="flex gap-x-4">
                    <Checkbox
                      checked={agreedTerms[idx]}
                      onCheckedChange={() => toggleAgreedTerm(idx)}
                    />
                    <p className="text-secondary-foreground">{term}</p>
                  </div>
                ))}
                <div className="flex gap-x-4">
                  <Checkbox
                    checked={agreedTerms[TERMS.length]}
                    onCheckedChange={() => toggleAgreedTerm(TERMS.length)}
                  />
                  <p className="">
                    I agree to the{" "}
                    <ExternalLink
                      href="https://www.optimism.io/data-privacy-policy"
                      className="font-medium"
                    >
                      Optimism Foundation&apos;s Privacy Policy
                    </ExternalLink>
                    .
                  </p>
                </div>
              </div>
              <Button
                disabled={!canSubmitForm || isLoading || !hasSelectedProjects}
                onClick={submitApplication}
                className="w-full mt-2"
                type="button"
                variant="destructive"
                isLoading={isLoading}
              >
                Submit application
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Form>
  )
}

export default ApplicationFormTabs
