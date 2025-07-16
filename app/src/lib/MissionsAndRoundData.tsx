import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { FeaturedProject } from "@/components/missions/details/FeaturedProjects"
import { SupportOption } from "@/components/missions/details/GetSupport"
import { HowItWorksStep } from "@/components/missions/details/HowItWorks"
import { LearnMoreLink } from "@/components/missions/details/LearnMore"

import { auditGrantsData } from "./utils/auditGrantsData"
import { foundationMissionsData } from "./utils/foundationMissions"

import { growthGrantsData } from "./utils/growthGrantsData"
import { retroFundingDevToolingData } from "./utils/retroFundingDevToolingData"
import { retroFundingOnchainBuildersData } from "./utils/retroFundingOnchainBuildersData"

export const rewardMeasurementDate = new Date("2025-03-10T21:53:13.300Z")

export type MissionData = FundingRoundData & {
  pageName: string
  ogDescription: string
  roundName: string
  missionPageEligibility?: {
    reactNode: React.ReactNode
    type?: "required" | "extraRewards" | "optional"
  }[]
  applicationPageEligibility: { reactNode: React.ReactNode; type?: string }[]
  footer?: React.ReactNode
  rewards?: { measurement: React.ReactNode; criteria: string[] }
  applyBy: Date
  evaluationMonth: number
  howItWorks?: HowItWorksStep[]
  featuredProjects?: FeaturedProject[]
  learnMoreLinks?: LearnMoreLink[]
  supportOptions?: SupportOption[]
}

export type FundingRoundData = {
  number: number
  name: string
  details: string[] | React.ReactNode[]
  subDetails?: React.ReactNode
  status: "open" | "upcoming" | "past" | "ongoing"
  link?: string
  resultsLink?: string
  iconUrl?: string
  startsAt: Date
  endsAt: Date
  funding?: {
    dollar?: string
    op?: string
    projects?: number
  }
  callout?: React.ReactNode[]
  showSupportedNetworks?: boolean
  season?: string
}

export const MISSIONS: MissionData[] = [
  growthGrantsData,
  auditGrantsData,
  foundationMissionsData,
  retroFundingDevToolingData,
  retroFundingOnchainBuildersData,
]

export const PAST_FUNDING_ROUNDS: FundingRoundData[] = [
  {
    name: "Round 6: Governance",
    number: 6,
    funding: {
      op: "Up to 3.5M",
    },
    details: [
      "Retro Funding: Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this category. By incentivizing contributions that enhance governance tools, mechanisms, and processes, Retro Funding aims to foster a more robust and resilient governance framework within the ecosystem.",
    ],
    status: "past",
    resultsLink: "/round/results?rounds=6",
    iconUrl: "/assets/images/round-6.svg",
    startsAt: new Date("2024-09-26T21:53:13.300Z"),
    endsAt: new Date("2024-10-14T21:53:13.300Z"),
  },
  {
    name: "Round 5: OP Stack",
    number: 5,
    funding: {
      op: "Up to 8M",
    },
    details: [
      "Retro Funding: Round 5 will reward OP Stack contributions. This includes direct contributions to the OP Stack, as well as its key dependencies. The round will reward impact which has been generated between October 2023 - July 2024. Impact will be rewarded within the following three categories: Ethereum Core Contributions, OP Stack Research & Development, and OP Stack Tooling. ",
    ],
    status: "past",
    resultsLink: "/round/results?rounds=5",
    iconUrl: "/assets/images/round-5-transparent.svg",
    startsAt: new Date("2024-08-14T21:53:13.300Z"),
    endsAt: new Date("2024-09-07T00:00:00.300Z"),
  },
  {
    name: "Round 4: Onchain Builders",
    number: 4,
    funding: {
      op: "10M",
    },
    details: [
      "Retro Funding: This category will reward onchain builders who contribute to the success of Optimism. This round seeks to expand the...",
    ],
    status: "past",
    link: "/projects/new",
    resultsLink: "/round/results?rounds=4",
    iconUrl: "/assets/images/round-4.svg",
    startsAt: new Date("2024-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-06T21:53:13.300Z"),
  },
  {
    name: "Round 3",
    number: 3,
    funding: {
      op: "30M",
      projects: 501,
    },
    link: "https://optimism.mirror.xyz/Bbu5M1mTNV2Z637QxOiF7Qt7R9hy6nxghbZiFbtZOBA",
    details: [
      "Retro Funding: Supporting Optimism builders with developer tooling is the focus of this category. From SDKs to testing frameworks...",
    ],
    status: "past",
    startsAt: new Date("2023-10-01T21:53:13.300Z"),
    endsAt: new Date("2023-11-01T21:53:13.300Z"),
  },
  {
    name: "Round 2",
    number: 2,
    funding: {
      op: "10M",
      projects: 195,
    },
    link: "https://optimism.mirror.xyz/7v1DehEY3dpRcYFhqWrVNc9Qj94H2L976LKlWH1FX-8",
    details: [
      "Retro Funding: Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this...",
    ],
    status: "past",
    startsAt: new Date("2023-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-30T21:53:13.300Z"),
  },
  {
    name: "Round 1",
    number: 1,
    funding: {
      dollar: "$1M",
      projects: 58,
    },
    details: [
      "Retro Funding: The OP Stack is the heart of Optimism, and the Superchain. Contributions to the OP Stack and improvements to the...",
    ],
    status: "past",
    startsAt: new Date("2022-11-22T21:53:13.300Z"),
    endsAt: new Date("2023-01-01T21:53:13.300Z"),
  },
]

export const FUNDING_ROUNDS: FundingRoundData[] = [
  ...MISSIONS,
  ...PAST_FUNDING_ROUNDS,
]

// Defining this for retro funding page.
export const MISSIONS_AND_ROUNDS = [
  retroFundingDevToolingData,
  retroFundingOnchainBuildersData,
  ...PAST_FUNDING_ROUNDS,
]