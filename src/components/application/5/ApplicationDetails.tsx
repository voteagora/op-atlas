import Image from "next/image"
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
  endingText?: React.JSX.Element
  className?: string
}

// CATEGORIES array
export const CATEGORIES = [
  {
    id: "Ethereum Core Contributions",
    title: "Ethereum Core Contributions",
    icon: "/assets/images/application-category-1.png",
    description:
      "Ethereum Core Contributions are infrastructure which supports, or is a dependency, of the OP Stack.",
    examples:
      "Smart contract languages, Ethereum consensus & execution clients, EVM, Ethereum testnets, Cryptography research.",
    eligibility: [
      "Ethereum client implementations",
      "Ethereum test networks",
      "Infrastructure to test and deploy chains",
      "Languages which are dedicated to develop smart contracts",
      "Research which informs Ethereum core development",
    ],
    endingText: (
      <p className="text-secondary-foreground">
        Projects which are used to develop or deploy contracts or apps,
        including in the development and deployment of Optimism contracts, will
        be rewarded in Retro Funding 7: Dev Tooling and are not in scope for
        this category.
      </p>
    ),
    className: "bg-blue-200",
  },
  {
    id: "OP Stack Research & Development",
    title: "OP Stack Research & Development",
    icon: "/assets/images/application-category-2.png",
    description:
      "Direct research & development contributions to the OP Stack, and contributions that support protocol upgrades.",
    examples:
      "Optimism Protocol upgrades, OP Stack Client Implementations, modules & mods, audits and Fault Proof VM implementations",
    eligibility: [
      "Work on core components of the OP Stack",
      "Research or development that introduces new features",
      "Security audits specifically on the OP Stack",
    ],
    endingText: (
      <p className="text-secondary-foreground">
        <ExternalLink
          className="underline"
          href="https://github.com/ethereum-optimism/optimism"
        >
          Optimism Monorepo
        </ExternalLink>{" "}
        contributions are not rewarded within Retro Funding 5. Commits to the
        monorepo are mainly done by Optimism core devs and the core dev program
        is not developed enough to support outside contributions to the monorepo
        yet.
      </p>
    ),
    className: "bg-green-200",
  },
  {
    id: "OP Stack Tooling",
    title: "OP Stack Tooling",
    icon: "/assets/images/application-category-3.png",
    description:
      "Efforts that improve the usability and accessibility of the OP Stack through tooling enhancements.",
    examples:
      "Integration and load testing infrastructure, scripts for running an Optimism node, RaaS providers.",
    eligibility: [
      "Tools that facilitate the deployment, operation, or testing of the OP Stack",
      "Services for deploying and hosting an OP Chain",
    ],
    className: "bg-orange-200",
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
      "This will help simplify the process as English is the working language of the majority of Badgeholders. Please ensure you translate any content that’s part of the application.",
  },
  {
    title: "Duplicate Applications",
    description:
      "Multiple applications from the same individual, project, or group which apply for the same impact.",
  },
]

const ApplicationDetails = () => {
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
          Round 5 will reward OP Stack contributions. This includes direct
          contributions to the OP Stack, as well as its key dependencies.
        </p>
        <p>
          The round will reward impact which has been generated between October
          2023 - July 2024. Impact will be rewarded within the following three
          categories: Ethereum Core Contributions, OP Stack Research &
          Development, and OP Stack Tooling.
        </p>
        <p>
          A single project can only apply to one OP Stack category. This means
          that each distinct contribution you have to the OP Stack should be
          setup as its own project.
        </p>
      </div>
      {/* Timeline */}
      <div className="flex flex-col gap-y-6">
        <h3>Timeline</h3>
        <p className="text-secondary-foreground">
          The deadline for applications is Sep 5 at 19:00 UTC. After you apply,
          you can still make edits to your projects until the deadline. You do
          not need to resubmit your application if you make edits, but you do
          need to republish your metadata onchain.
        </p>
      </div>
      {/* Eligibility */}
      <div className="flex flex-col gap-y-6">
        <h3>Eligibility</h3>
        <p className="text-secondary-foreground">
          The round will reward impact which has been generated between October
          2023 - July 2024. Impact will be rewarded within the following three
          categories: Ethereum Core Contributions, OP Stack Research &
          Development, and OP Stack Tooling.
        </p>
        <p>
          Each category has it’s own eligibility criteria. Please review the
          following category descriptions carefully.
        </p>
        <Separator className="m-6" />
        {CATEGORIES.map((category, index) => (
          <React.Fragment key={index}>
            <ContributionsSection
              category={index + 1}
              icon={category.icon}
              title={category.title}
              description={category.description}
              examples={category.examples}
              eligibility={category.eligibility}
              endingText={category.endingText}
              className={category.className}
            />
            <Separator />
          </React.Fragment>
        ))}
      </div>

      {/* Rules */}

      <div className="flex flex-col gap-y-6">
        <h3>Rules</h3>
        <p>
          Failure to adhere to the RULES listed below will result in
          disqualification.
        </p>

        <ul className="list-disc list-outside pl-2 text-base font-normal text-secondary-foreground">
          {RULES.map((rule, index) => (
            <li key={index} className="">
              {rule.title}:{rule.description}
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant="destructive"
        onClick={() => {
          status === "unauthenticated"
            ? onClickGetStarted()
            : router.push("/application/5?tab=projects")
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
  endingText,
  className,
}: ContributionsSectionProps) => (
  <section className="flex flex-col gap-6">
    <header className="flex items-center gap-x-6">
      <div
        className={cn(
          "min-w-[120px] h-[120px] flex justify-center items-center rounded-2xl",
          className,
        )}
      >
        <Image
          src={icon}
          alt={title}
          width={120}
          height={120}
          className="rounded-2xl"
        />
      </div>
      <div>
        <p className="font-semibold text-foreground">Category {category}</p>
        <h4 className="text-xl font-semibold">{title}</h4>
        <p className="mt-2 text-secondary-foreground">{description}</p>
      </div>
    </header>

    <h4 className="font-semibold text-base text-secondary-foreground">
      Examples: <span className="font-normal">{examples}</span>
    </h4>

    <h4 className="font-semibold text-base text-secondary-foreground">
      Eligibility:{" "}
      <span className="font-normal">
        Projects are eligible who can be described as one of the following:
      </span>
    </h4>
    <ul className="list-disc list-inside mt-2 text-secondary-foreground">
      {eligibility.map((criteria, index) => (
        <li key={index}>{criteria}</li>
      ))}
    </ul>
    {endingText}
  </section>
)

export default ApplicationDetails
