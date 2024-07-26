"use client"
import React, { useState } from "react"

import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ApplicationDetails from "./ApplicationDetails"
import ApplicationProjectImpact from "./ApplicationProjectImpact"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are distributed must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that no member of the team receiving the grant is a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, Belarus, the Democratic Republic of Congo, Iran, North Korea, the Russian Federation, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that the potential beneficiary of the grant is not barred from participating in Optimism's grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

const ApplicationFormTabs = () => {
  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length + 1 }, () => false),
  )

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }
  return (
    <Tabs defaultValue="details" className="w-full">
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
          <ApplicationProjectImpact />
        </TabsContent>

        {/* submit application content */}
        <TabsContent value="application">
          <div className="flex flex-col gap-y-6 ">
            <h3>Agree and submit your application</h3>
            <p className="my-2">
              Optimism will issue an onchain attestation on your behalf when you
              submit this application. You can make edits and resubmit this
              application until the deadline (Aug 1 at 19:00 UTC).{" "}
            </p>

            <div className="flex flex-col gap-y-4 ml-px">
              {TERMS.map((term, idx) => (
                <div key={idx} className="flex gap-x-4">
                  <Checkbox
                    disabled
                    checked={agreedTerms[idx]}
                    onCheckedChange={() => toggleAgreedTerm(idx)}
                    className="mt-1 border-2 rounded-[2px]"
                  />
                  <p className="">{term}</p>
                </div>
              ))}
              <div className="flex gap-x-4">
                <Checkbox
                  disabled
                  checked={agreedTerms[TERMS.length]}
                  onCheckedChange={() => toggleAgreedTerm(TERMS.length)}
                  className="mt-1 border-2 rounded-[2px]"
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
            <Button className="w-full mt-2" type="button" variant="destructive">
              Submit application
            </Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

export default ApplicationFormTabs
