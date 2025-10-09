import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { clickSignInWithFarcasterButton, cn } from "@/lib/utils"

interface ContributionsSectionProps {
  category: number
  title: string
  icon: string
  description: string
  examples: string
  eligibility: string[]
  notEligibility: string[] | React.JSX.Element[]
  endingText?: React.JSX.Element
}

// CATEGORIES array
export const CATEGORIES = [
  {
    id: "Governance Infrastructure & Tooling",
    title: "Governance Infrastructure & Tooling",
    icon: "/assets/images/governance-category-1.svg",
    description:
      "Infrastructure and tooling that powered governance or that made the usage of governance infrastructure more accessible.",
    examples:
      "Work on Optimism Governor contracts, Optimism Governance voting clients and interfaces, work on Optimism identity and reputation infrastructure, Retro Funding voting clients and sign up.",
    eligibility: [
      "Governance Infrastructure: Technical infrastructure that powers the voting process within Optimism Governance.",
      "Governance Tooling: Tools that are used by Delegates or Citizens to participate in Optimism Governance.",
      "Grants Tooling: Tools that support the Token House grants process, including the operation of the Grants Council. Tools which power or support the Retro Funding process.",
    ],
    notEligibility: [
      "Non-Optimism related governance tooling: Tools that have not been used in Optimism Governance.",
      "Resources for Governance Onboarding: Documentation, educational videos or other resources that are dedicated to explaining Optimism Governance.",
    ],
  },
  {
    id: "Governance Analytics",
    title: "Governance Analytics",
    icon: "/assets/images/governance-category-2.svg",
    examples:
      "Governance performance reports, Finance and Grant related analytics & reports, Delegate/Citizen voting power and activity analytics.",
    description:
      "Analytics that enabled accountability, provided transparency into Collective operations, promoted improved performance, or aided in the design of the Collective.",
    eligibility: [
      "Optimism Governance related Analytics: Analyses of the performance of Optimism governance, including governance participation, grant allocation and more.",
    ],
    notEligibility: [
      "Analytics infrastructure or reports which are not related to Optimism Governance.",
    ],
  },
  {
    id: "Governance Leadership",
    title: "Governance Leadership",
    icon: "/assets/images/governance-category-3.svg",
    description:
      "Demonstrated leadership in the Collective, including but not limited to, hosting community calls and/or participation in councils, boards and commissions beyond executing on basic responsibilities outlined in Token House Charters.",
    examples:
      "Various Optimism Governance Councils, Commissions and Boards, governance process facilitation.",
    eligibility: [
      "Councils, Commissions and Advisory Boards; NERD programs focused exclusively on core governance responsibilities (GovNERDs). This includes Security Council, Grants Council, Developer Advisory Board, Code of Conduct Council, Anticapture Commission, Collective Feedback Commissions and GovNERDs.",
      "Governance facilitation of critical governance processes and/or experiments such as community calls, proposal creation or review sessions, deliberations or similar",
    ],
    notEligibility: [
      <ul key="nel" className="list-disc list-outside">
        <li key={1}>Governance onboarding and promotion initiatives.</li>
        <li key={2}>
          Delegate or Citizen governance participation, including forum
          engagement, participation in calls & workshops, participation in
          survey and other activities which are part of the responsibilities of
          citizens and delegates. These activities are rewarded separately as
          part of the
          <ExternalLink
            className="underline"
            href="https://gov.optimism.io/t/season-5-retro-governance-participation-rewards/8105"
          >
            {" "}
            Retro Governance Participation Rewards 10{" "}
          </ExternalLink>
        </li>
        <li key={3}>
          Each of the above mentioned Councils, Commissions, Advisory Boards and
          NERD programs are required to submit one application as a group,
          individual participation within one of the groups is not eligible. The
          allocation of rewards among group members should be proposed by the
          team Lead and is subject to the consensus mechanism of that group
          outlined in their internal operating procedures
        </li>
        <li key={4}>
          Governance Leadership within Governance Season 4 is not considered
          within this round, as it was already rewarded in Retro Funding 3.
        </li>
      </ul>,
    ],
  },
]

// Rules array

const RULES = [
  {
    title: "Promises of Future Impact",
    description: "Promises of future deliverables or impact are not allowed.",
  },
  {
    title: "False Statements & Deception",
    description:
      "False claims about your contributions, past impact or funding & grants are not allowed.",
  },
  {
    title: "Hateful Content",
    description:
      "No racist, sexist, or otherwise hateful speech, no discrimination.",
  },
  {
    title: "Deceiving Badgeholders",
    description:
      "Malicious content that could cause harm or unintended consequences to users.",
  },
  {
    title: "Fraud & Impersonation",
    description:
      "Claiming to be a brand or person you are not. The Grant owner must be directly affiliated with the project, the funds must go to the project.",
  },
  {
    title: "Advertising",
    description:
      "Using RetroPGF application to showcase something you are selling like a token sale or NFT drop.",
  },
  {
    title: "Bribery",
    description: "Bribing badgeholders or vote buying is strictly forbidden.",
  },
  {
    title: "Contacting Badgeholders to Promote Your Application",
    description:
      "Using private channels such as DMs to promote your applications to badgeholders.",
  },
  {
    title: "All Recipients are Subject to KYC",
    description:
      "If you do not pass KYC, your grant will be returned to the RetroPGF treasury for future rounds.",
  },
  {
    title: "Outside of Retro Funding Scope",
    description:
      "Contributions that do not have a clear relationship to Optimism, applications that do not highlight a valid contribution or contributions which are outside of the RetroPGF scope.",
  },
  {
    title: "Spam",
    description:
      "Applications containing spam, such as irrelevant answers, plagiarized content, broken or unrelated impact metrics and contribution links will be disqualified.",
  },
  {
    title: "Applications in Languages Other Than English Will Be Discarded",
    description:
      "This will help simplify the process as English is the working language of the majority of Badgeholders. Please ensure you translate any content that's part of the application.",
  },
  {
    title: "Duplicate Applications",
    description:
      "Multiple applications from the same individual, project, or group which apply for the same impact.",
  },
]

const ApplicationDetails = ({ onNext }: { onNext?: () => void }) => {
  const router = useRouter()
  const { data, status } = useSession()
  const user = data?.user

  const onClickGetStarted = () => {
    clickSignInWithFarcasterButton()
  }

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-6 text-secondary-foreground">
        <p>
          Retroactive Public Goods Funding (Retro Funding) 6 will reward
          contributions to Optimism Governance, including governance
          infrastructure & tooling, governance analytics, and governance
          leadership.
        </p>
      </div>
      {/* Timeline */}
      <div className="flex flex-col gap-y-6">
        <h3>Timeline</h3>
        <p className="text-secondary-foreground">
          The deadline for applications is Oct 14th at 19:00 UTC. After you
          apply, you can still make edits to{" "}
          <Link href="/dashboard" className="underline">
            your projects
          </Link>{" "}
          until the deadline. You do not need to resubmit your application if
          you make edits, but you do need to republish your metadata onchain.
        </p>
        <ul className="list-disc pl-5">
          <li className="pl-2">Sign up: Sept 26th - Oct 14th</li>
          <li className="pl-2">
            Application Review Process: Oct 14th - Oct 28th
          </li>
          <li className="pl-2">Voting: Oct 28th - Nov 7th</li>
          <li className="pl-2">Results: Nov 19th</li>
        </ul>
      </div>
      {/* Eligibility */}
      <div className="flex flex-col gap-y-6">
        <h3>Eligibility</h3>
        <p className="text-secondary-foreground">
          Retro Funding 6: Governance will reward impact which has been
          generated between October 2023 - September 18th 2024. This includes
          impact relating to Governance Season 5 and Season 6 (up until Voting
          Cycle #28), as well as impact relating to the design and execution of
          Retro Funding 3, 4, & 5.
        </p>
        <p>Impact will be rewarded within the following categories:</p>
        <Separator className="my-6" />
        {CATEGORIES.map((category, index) => (
          <React.Fragment key={index}>
            <ContributionsSection
              category={index + 1}
              icon={category.icon}
              title={category.title}
              description={category.description}
              examples={category.examples}
              eligibility={category.eligibility}
              notEligibility={category.notEligibility}
            />
            <Separator
              className={CATEGORIES.length - 1 === index ? "mt-6" : "my-6"}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Round Size */}

      <div className="flex flex-col gap-y-6">
        <h3>Round Size</h3>
        <p className="text-secondary-foreground">
          Citizens will vote on the round&apos;s OP allocation within the voting
          experience. The Foundation is assigning a minimum OP Amount for the
          round of 1.1M OP and a maximum OP amount of 3.5M OP. Citizens will be
          able to vote for an OP amount within the range of minimum and maximum
          which they believe appropriately rewards the impact within the round.
          The round allocation will be decided by taking the median of
          Citizens&apos; votes.
        </p>

        <p>
          For additional information on round size, how voting works, and how
          grant claiming works,{" "}
          <ExternalLink
            className="underline"
            href="https://gov.optimism.io/t/retro-funding-6-governance-round-details/8870"
          >
            view the forum
          </ExternalLink>
          .
        </p>
      </div>

      {/* Rules */}

      <div className="flex flex-col gap-y-6">
        <h3>Rules</h3>
        <p className="text-secondary-foreground">
          Failure to adhere to the rules listed below will result in
          disqualification.
        </p>

        <ul className="list-disc list-outside pl-4 text-base font-normal text-secondary-foreground">
          {RULES.map((rule, index) => (
            <li key={index} className="">
              {rule.title}: {rule.description}
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant="destructive"
        type="button"
        onClick={() => {
          if (status === "unauthenticated") {
            onClickGetStarted()
          } else {
            onNext?.()
            router.push("/application/6?tab=projects")
          }
        }}
        className="w-full disabled:bg-destructive disabled:!text-white"
      >
        {user ? "Next" : " Sign in to apply for Retro Funding"}
      </Button>
    </div>
  )
}

const ContributionsSection = ({
  category,
  icon,
  title,
  description,
  examples,
  eligibility,
  notEligibility,
  endingText,
}: ContributionsSectionProps) => (
  <section className="flex flex-col gap-6">
    <header className="flex items-center gap-x-6">
      <div className="min-w-[120px] h-[120px] flex justify-center items-center rounded-2xl">
        <Image
          src={icon}
          alt={title}
          width={120}
          height={120}
          className="rounded-2xl"
        />
      </div>
      <div>
        <p className="font-normal text-foreground">Category {category}</p>
        <h4 className="text-xl font-normal">{title}</h4>
        <p className="mt-2 text-secondary-foreground">{description}</p>
      </div>
    </header>

    <h4 className="font-normal text-base text-secondary-foreground">
      Examples: <span className="font-normal">{examples}</span>
    </h4>

    <h4 className="font-normal text-base text-secondary-foreground">
      Eligibility:{" "}
      <span className="font-normal">
        The following types of projects are eligible.
      </span>
    </h4>
    <ul className="list-disc list-outside pl-4  text-secondary-foreground">
      {eligibility.map((criteria, index) => (
        <li key={index}>{criteria}</li>
      ))}
    </ul>
    <h4 className="font-normal text-base text-secondary-foreground">
      Not eligible:{" "}
      <span className="font-normal">
        The following types of projects are not eligible.
      </span>
    </h4>
    <ul className="list-disc list-outside pl-4 text-secondary-foreground">
      {notEligibility?.map((criteria, index) => {
        return typeof criteria === "string" ? (
          <li key={index}>{criteria}</li>
        ) : (
          criteria
        )
      })}
    </ul>
    {endingText}
  </section>
)

export default ApplicationDetails
