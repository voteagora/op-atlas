"use client"
import React, { useState } from "react"
import { FundingRound } from "@/lib/mocks"
import { Project } from "@/components/missions/Project"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectWithDetails } from "@/lib/types"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function ApplyDetails({
  projects,
  round,
}: {
  projects: ProjectWithDetails[]
  round: FundingRound
}) {
  const [currentTab, setCurrentTab] = useState("details")

  const router = useRouter()

  return (
    <div className="mt-16 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-96 grid-cols-2 bg-background">
          <TabsTrigger
            className={`flex justify-start data-[state=active]:bg-background data-[state=active]:shadow-none px-0`}
            value="details"
          >
            <span className="pr-2">1</span> Choose projects
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
            <p className="text-2xl font-bold">Choose projects</p>

            {projects.length > 0 ? (
              projects.map((field, index) => (
                <Project
                  key={field.id}
                  index={index}
                  project={field}
                  round={round}
                />
              ))
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
        </div>
      </Tabs>
    </div>
  )
}
