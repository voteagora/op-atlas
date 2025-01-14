"use client"
import React, { useState } from "react"
import { FundingRound } from "@/lib/mocks"
import { Project } from "@/components/missions/Project"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectWithDetails } from "@/lib/types"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import CircleWithCheckmark from "../common/CircleWithGreenCheckmark"
import { FormField } from "../ui/form"
import { Checkbox } from "../ui/checkbox"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ApplicationFormSchema } from "../application/5/ApplicationFormTabs"
import { zodResolver } from "@hookform/resolvers/zod"
import ExternalLink from "../ExternalLink"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are awarded must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that no member of the team receiving the grant is a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, Belarus, the Democratic Republic of Congo, Iran, North Korea, the Russian Federation, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that no member of the team receiving the grant is barred from participating in Optimism’s grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

export function ApplyDetails({
  projects,
  round,
}: {
  projects: ProjectWithDetails[]
  round: FundingRound
}) {
  const [currentTab, setCurrentTab] = useState("details")

  const router = useRouter()

  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length + 1 }, () => false),
  )

  console.log(agreedTerms)

  const canSubmitForm = agreedTerms.every((term) => term)

  console.log(canSubmitForm)

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      projects: [],
    },
    shouldFocusError: true,
    mode: "onChange",
  })

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  return (
    <div className="mt-16 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
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
          >
            <span className="pr-2">2</span> Agree to terms
          </TabsTrigger>
        </TabsList>
        <div className="mt-12">
          {/* application details content */}
          <TabsContent value="details">
            <p className="text-2xl font-bold mb-5">Choose projects</p>

            {projects.length > 0 ? (
              <>
                {projects.map((field, index) => (
                  <Project
                    key={field.id}
                    index={index}
                    project={field}
                    round={round}
                    form={form}
                  />
                ))}
                <Button
                  className="bg-optimismRed text-white mt-10"
                  variant={"ghost"}
                >
                  Next
                </Button>
              </>
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
                  <Button
                    className="bg-optimismRed text-white w-44"
                    variant={"outline"}
                  >
                    Add Project
                  </Button>
                  <Button
                    className="w-44"
                    variant={"outline"}
                    onClick={() => {
                      router.push(`/missions/${round.pageName}`)
                    }}
                  >
                    View Mission Details
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="terms">
            <p className="text-2xl font-bold mb-5">Agree and apply</p>

            <div className="flex flex-col gap-y-4 ml-px">
              {TERMS.map((term, idx) => (
                <div key={idx} className="flex gap-x-4">
                  <Checkbox
                    className="mt-1"
                    checked={agreedTerms[idx]}
                    onCheckedChange={() => toggleAgreedTerm(idx)}
                  />
                  <p className="text-secondary-foreground">{term}</p>
                </div>
              ))}

              <div className="flex gap-x-4">
                <Checkbox
                  className="mt-1"
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
              className="bg-optimismRed text-white mt-10"
              variant={"ghost"}
              disabled={!canSubmitForm}
            >
              Submit
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}