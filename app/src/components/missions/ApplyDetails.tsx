"use client"
import React, { useState } from "react"
import { FundingRound } from "@/lib/mocks"
import { Project } from "@/components/missions/Project"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectWithDetails } from "@/lib/types"

export function ApplyDetails({
  projects,
  round,
}: {
  projects: ProjectWithDetails[]
  round: FundingRound
}) {
  const [currentTab, setCurrentTab] = useState("details")

  return (
    <div className="mt-16 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-96 grid-cols-2 bg-background">
          <TabsTrigger
            className={`flex justify-start data-[state=active]:bg-background data-[state=active]:shadow-none`}
            value="details"
          >
            1 Choose projects
          </TabsTrigger>
          <TabsTrigger
            className={`flex justify-start data-[state=active]:bg-background data-[state=active]:shadow-none`}
            value="terms"
          >
            2 Agree to terms
          </TabsTrigger>
        </TabsList>
        <div className="mt-12">
          {/* application details content */}
          <TabsContent value="details">
            <p className="text-2xl font-bold">Choose projects</p>
            {projects.map((field, index) => (
              <Project
                key={field.id}
                index={index}
                project={field}
                round={round}
              />
            ))}{" "}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
