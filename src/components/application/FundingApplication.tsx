import { Application } from "@prisma/client"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

import { Badge } from "../common/Badge"
import { Callout } from "../common/Callout"
import { CheckIconFilled } from "../icons/checkIconFilled"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { ProjectCard } from "./ProjectCard"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are distributed must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that the potential beneficiary of the grant is not a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, the Democratic Republic of Congo, Iran, North Korea, Russia, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that the potential beneficiary of the grant is not barred from participating in Optimism's grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

export const FundingApplication = ({
  className,
  projects,
  applications,
  onApply,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: Application[]
  onApply: (projectId: string) => Promise<void>
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length }, () => false),
  )

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  const hasApplied = applications.length > 0
  const appliedProjectIds = applications.map(
    (application) => application.projectId,
  )

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectId((current) => {
      return projectId === current ? null : projectId
    })
  }

  const submitApplication = async () => {
    if (!selectedProjectId) return

    try {
      setIsLoading(true)
      await onApply(selectedProjectId)
    } catch (error) {
      console.error("Error submitting application", error)
      setIsLoading(false)
    }
  }

  const canSubmit = agreedTerms.every((term) => term) && !!selectedProjectId

  return (
    <div
      className={cn(
        "flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-y-6">
        <Image
          alt="sunny"
          src="/assets/images/sunny-eth.png"
          height={80}
          width={80}
        />
        <h2 className="text-center">Retro Funding Round 4: Onchain Builders</h2>
        {hasApplied ? (
          <div className="flex items-center gap-1 py-1 px-3 bg-success rounded-full">
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16}
              width={16}
              alt="Submitted"
            />
            <p className="font-medium text-success-foreground">
              Application submitted on{" "}
              {format(applications[0].createdAt, "MMMM d, h:mm a")}
            </p>
          </div>
        ) : (
          <Badge
            size="lg"
            text="Submit this application by June 6th at 23:59 UTC"
          />
        )}
      </div>

      {/* Information */}
      <div className="flex flex-col gap-y-6 text-secondary-foreground">
        <p>
          Retro Funding 4 will reward onchain builders who have deployed
          contracts to the Superchain and contributed to the success of
          Optimism. This round seeks to expand the reach and impact of the
          network by rewarding those building across the Superchain who have
          increased demand for blockspace and driven value to the Collective.
        </p>
        <p>
          In an effort to make voting in this round as objective as possible,
          your project&apos;s code and contracts will be analyzed using
          quality-metrics. Citizen badgeholders will vote on the quality-metrics
          that matter most to them, not on individual projects.{" "}
          <Link href="#" className="font-medium">
            Learn more
          </Link>
        </p>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-y-6">
        <h3>Timeline</h3>
        <p className="text-secondary-foreground">
          The deadline for applications is June 6th at 19:00 UTC. After you
          apply, you can still make edits to your projects until the deadline.
          You do not need to resubmit your application if you make edits, but
          you do need to republish your metadata onchain.
        </p>
      </div>

      {/* Eligibility */}
      <div className="flex flex-col gap-y-6">
        <h3>Eligibility</h3>

        <p>
          Builders who are eligible for Round 4 have met the following criteria:
        </p>

        <ul className="list-disc space-y-4 pl-5 text-secondary-foreground">
          <li>
            Deployed their onchain contracts on one or multiple of the following
            OP chains: OP Mainnet, Base, Zora, Mode, Frax, and Metal.
          </li>
          <li>
            Onchain contracts have interactions from at least 420 unique
            addresses between Jan 1st - May 1st 2024.
          </li>
          <li>
            Onchain contracts had their first transaction before April 1st 2024.
          </li>
          <li>
            Onchain contracts had more than 10 days of activity between Jan 1st
            - May 1st 2024.
          </li>
          <li>
            Verified their onchain contracts in the Retro Funding sign up
            process.
          </li>
          <li>
            Made their contract code available in a public Github repo, for
            which ownership has been verified in the Retro Funding sign up
            process.
          </li>
          <li>
            Confirmed that they will comply with Optimism Foundation KYC
            requirements and are not residing in a sanctioned country.
          </li>
          <li>
            Submitted a Retro Funding application before June 6th, 2024 and
            comply with application rules.
          </li>
        </ul>
      </div>

      {/* Projects */}
      <div className="flex flex-col gap-y-6">
        <h3>Projects for submission</h3>

        {projects.length === 0 ? (
          <Callout
            type="error"
            text="You haven't created or joined any projects"
            linkText="View projects"
            linkHref="/dashboard"
          />
        ) : (
          <div className="flex flex-col gap-y-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                disabled={hasApplied}
                isSelected={
                  selectedProjectId === project.id ||
                  appliedProjectIds.includes(project.id)
                }
                onSelect={toggleProjectSelection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Terms */}
      <div className="flex flex-col gap-y-6">
        <h3>Terms</h3>

        <div className="flex flex-col gap-y-4 ml-px">
          {TERMS.map((term, idx) => (
            <div key={idx} className="flex gap-x-4">
              <Checkbox
                disabled={hasApplied}
                checked={agreedTerms[idx] || hasApplied}
                onCheckedChange={() => toggleAgreedTerm(idx)}
                className="mt-1 border-2 rounded-[2px]"
              />
              <p className="">{term}</p>
            </div>
          ))}
        </div>

        <p className="">
          See{" "}
          <Link href="#" className="font-medium">
            Optimism&apos;s Privacy Policy
          </Link>{" "}
          for information about how Retro Funding signup data is used.
        </p>
      </div>

      <Button
        size="lg"
        onClick={submitApplication}
        disabled={!canSubmit || isLoading}
        className="font-medium bg-destructive hover:bg-destructive"
      >
        Submit application
      </Button>
    </div>
  )
}
