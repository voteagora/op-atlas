import { Application } from "@prisma/client"
import { format } from "date-fns"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { submitApplications } from "@/lib/actions/applications"
import { ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { Badge } from "../common/Badge"
import { Callout } from "../common/Callout"
import ExternalLink from "../ExternalLink"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { ProjectCard } from "./ProjectCard"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are distributed must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that no member of the team receiving the grant is a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, Belarus, the Democratic Republic of Congo, Iran, North Korea, the Russian Federation, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that the potential beneficiary of the grant is not barred from participating in Optimism's grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

export const FundingApplication = ({
  className,
  projects,
  applications,
  onApplied,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: Application[]
  onApplied: (application: Application) => void
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length + 1 }, () => false),
  )

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])

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
    setSelectedProjectIds((current) => {
      const idx = current.indexOf(projectId)
      if (idx === -1) {
        return [...current, projectId]
      } else {
        return current.filter((id) => id !== projectId)
      }
    })
  }

  const { track } = useAnalytics()
  const submitApplication = async () => {
    if (selectedProjectIds.length === 0) return

    setIsLoading(true)

    const promise: Promise<Application> = new Promise(
      async (resolve, reject) => {
        try {
          const result = await submitApplications(selectedProjectIds)
          if (result.error !== null || result.applications.length === 0) {
            throw new Error(result.error ?? "Error submitting application")
          }

          for (const application of result.applications) {
            track("Apply", {
              projectIds: application.projectId,
              attestationId: application.attestationId,
            })
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
        onApplied(application)
        return "Application submitted"
      },
      error: (error) => {
        setIsLoading(false)
        return error.message
      },
    })
  }

  const canSubmit =
    agreedTerms.every((term) => term) && selectedProjectIds.length > 0

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
          src="/assets/images/round-4-transparent.svg"
          height={124}
          width={124}
        />
        <h2 className="text-center">Retro Funding Round 4: Onchain Builders</h2>
        {hasApplied ? (
          <div className="flex items-center gap-2 p-4 bg-success rounded-xl w-full">
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16}
              width={16}
              alt="Submitted"
            />
            <div className="flex flex-col text-success-foreground">
              <p className="font-medium text-sm">
                Application submitted on{" "}
                {format(applications[0].createdAt, "MMMM d, h:mm a")}
              </p>
              <p className="text-sm">
                You can resubmit with additional projects until June 6th at
                19:00 UTC.
              </p>
            </div>
          </div>
        ) : (
          <Badge
            size="lg"
            text="Submit this application by June 6th at 19:00 UTC"
            className="py-1.5 px-4 text-base"
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
          that matter most to them, not on individual projects.
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
            Onchain contracts have interactions from 420 unique addresses during
            Jan 1st - May 1st 2024.
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
            Confirm that you and your team will comply with the Optimism
            Foundation&apos;s KYC requirements, and that you understand the
            geographic restrictions.
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
                hasApplied={appliedProjectIds.includes(project.id)}
                isSelected={
                  selectedProjectIds.includes(project.id) ||
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
                checked={agreedTerms[idx]}
                onCheckedChange={() => toggleAgreedTerm(idx)}
                className="mt-1 border-2 rounded-[2px]"
              />
              <p className="">{term}</p>
            </div>
          ))}
          <div className="flex gap-x-4">
            <Checkbox
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

        <p className="">
          See{" "}
          <ExternalLink
            href="https://www.optimism.io/data-privacy-policy"
            className="font-medium"
          >
            Optimism&apos;s Privacy Policy
          </ExternalLink>{" "}
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
