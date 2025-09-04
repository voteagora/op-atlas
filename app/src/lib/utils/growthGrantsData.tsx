import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { CalendarEventFill } from "@/components/icons/remix"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"

import { MissionData } from "../MissionsAndRoundData"

export const growthGrantsData: MissionData = {
  pageName: "growth-grants",
  name: "Growth Grants",
  number: 10,
  roundName: "Season 8 Growth Grants",
  funding: {
    op: "6.33M",
  },
  ogDescription:
    "Growth Grants are distributing up to 6.33M OP in Season 8. If you've built a Superchain app, sign up to check if you qualify for growth funding.",
  shortDescription:
    "For apps that have already deployed, looking to boost their TVL.",
  details: [
    <p key="details-1">
      Growth Grants support Superchain apps that have already launched and are
      ready to scale their impact in alignment with the{" "}
      <ExternalLink
        href="https://gov.optimism.io/t/season-8-intent/10009"
        className="underline"
      >
        Collective Intent
      </ExternalLink>
      . Applicants submit a plan for growth, methods for measuring success, and
      their desired capital allocation to execute their plan.
    </p>,
    <p key="details-2">
      For Season 8, plans should target at least one of the following success
      metrics:
      <ul className="list-disc pl-4 space-y-2 text-base text-secondary-foreground">
        <li className="mt-4">
          <span>Superchain TVL</span>
        </li>
        <li>
          <span>Superchain Transaction Fees</span>
        </li>
      </ul>
    </p>,
    <p key="details-3">
      Projects that are a good fit might focus on making Superchain assets{" "}
      <ExternalLink
        href="https://specs.optimism.io/interop/overview.html"
        className="underline"
      >
        interop-ready
      </ExternalLink>
      , building upgrades that increase TVL, or shipping features that drive
      cross-chain transactions. Other eligible projects may include tools that
      help track adoption, support conversions to interop formats, or create
      stronger incentives for ecosystem usage.
    </p>,
  ],
  season: "8",
  callout: [
    <GrantInfoCallout
      key="season-budget"
      title="Season Budget"
      description="6.33M OP"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="apply-by"
      title="Apply by"
      description="Dec 4, 2025"
      icon={<CalendarEventFill fill="#3374DB" />}
    />,
  ],
  showSupportedNetworks: true,
  status: "ongoing",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-08-15T00:00:00.000Z"),
  endsAt: new Date("2025-12-04T00:00:00.000Z"),
  applyBy: new Date("2025-12-04T00:00:00.000Z"),
  evaluationMonth: 9,
  missionPageEligibility: [
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project has deployed contracts on a supported chain
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project aligns with TVL or tx fees
        </p>
      ),
      type: "required",
    },
  ],
  applicationPageEligibility: [
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project has deployed contracts on a supported chain
        </p>
      ),
      type: "hasDeployedContracts",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project aligns with TVL or tx fees
        </p>
      ),
      type: "alignsWithInteropMetrics",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title: "Submit your application via the Grants Council website",
      description:
        "Inform the council of your plan for growth, including milestones and KPIs.",
      subDetails: "Visit site",
      subDetailsLink: "https://app.opgrants.io/",
    },
    {
      number: 2,
      title: "The GC reviews the application",
      description: "Review takes an average of 15 days.",
    },
    {
      number: 3,
      title: "If approved, the grant will be delivered at intervals",
      description:
        "40% upfront and 60% upon completion of critical milestones.",
    },
  ],
  featuredProjects: [
    {
      name: "Moonwell",
      description:
        "Moonwell is an open and decentralized lending and borrowing protocol built on Base.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/8d393569-26d8-4ce2-89cf-898077c88b52.png",
      href: "https://atlas.optimism.io/project/0xd4f0252e6ac2408099cd40d213fb6f42e8fa129b446d6e8da55e673598ef14c0",
      rewardAmount: "205k",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
    {
      name: "Sake Finance",
      description:
        "Sake Finance is the leading money markets protocol with a decentralized stablecoin and agentic strategies on Soneium.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/161e64ce-bd77-4b81-84a8-5ff04cc6013b.png",
      href: "https://atlas.optimism.io/project/0x18923b60296e26a8ce35a0b4754cd6fd5427b2820a202f82901c826794fdbc9e",
      rewardAmount: "66.9k",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
  ],
  supportOptions: [
    {
      type: "telegram",
      title: "Telegram",
      description: "Reach out anytime.",
      buttonText: "Join Channel",
      buttonLink: "https://t.me/+CCkKpqGJouk5ZjYx",
      externalLink: true,
    },
    {
      type: "office-hours",
      title: "Office Hours",
      description: "Bi-weekly on Tuesdays at 2:00 PM UTC.",
      buttonText: "Join Meeting",
      buttonLink: "https://meet.google.com/pcq-tqpt-fcm",
      externalLink: true,
    },
  ],
  learnMoreLinks: [
    {
      title: "S8 Governance Fund Missions",
      href: "https://gov.optimism.io/t/s8-governance-fund-missions/10004?u=gonna.eth",
    },
    {
      title: "Collective Grant Policies",
      href: "https://gov.optimism.io/t/collective-grant-policies/5833",
    },
  ],
}
