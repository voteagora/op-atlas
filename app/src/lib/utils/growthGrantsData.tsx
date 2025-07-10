import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { Calendar } from "@/components/icons/calendar"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { MissionData } from "../MissionsAndRoundData"

export const growthGrantsData: MissionData = {
  pageName: "growth-grants",
  name: "Growth Grants",
  number: 10,
  roundName: "Season 8 Growth Grants",
  funding: {
    op: "9M",
  },
  ogDescription:
    "Growth Grants are distributing up to 9M OP in Season 8. If you've built a Superchain app, sign up to check if you qualify for growth funding.",
  details: [
    <p key="details-1">
      Growth Grants are for Superchain apps that have already launched and are
      looking to scale their impact inline with the{" "}
      <ExternalLink
        href="https://collectiveintent.optimism.io/"
        className="underline"
      >
        Collective Intent
      </ExternalLink>
      . Projects submit a plan for growth, methods for measuring success, and
      their desired capital allocation to execute their plan.
    </p>,
    "For Season 8, growth plans should target the following success metrics:",
  ],
  season: "8",
  subDetails: (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="retro-funding" className="">
          <AccordionTrigger className="text-base p-0 hover:underline text-secondary-foreground font-normal">
            1. Interop-ready TVL
          </AccordionTrigger>
          <AccordionContent className="mt-6 mb-6">
            <ul className="list-disc pl-4 space-y-1 text-base">
              <li>
                Primary metric: TVL/AOP that is interop ready within the{" "}
                <ExternalLink
                  href="https://collectiveintent.optimism.io/"
                  className="underline"
                >
                  Interop Set
                </ExternalLink>
              </li>
              <li>
                Secondary metric: Percent (%) share of TVL/AOP within the
                Interop Set that&apos;s interop ready v.s. total TVL/AOP
              </li>
            </ul>
            <p className="mt-6">
              <span className="font-medium">Why this metric?</span>{" "}
              <ExternalLink
                href="https://collectiveintent.optimism.io/"
                className="underline"
              >
                Interop
              </ExternalLink>{" "}
              introduces new development and interaction patterns for
              application developers. Growing the volume and share of
              interop-compatible assets onchain increases the chance that
              interop is widely adopted by application developers and users
              alike.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="retro-funding" className="">
          <AccordionTrigger className="text-base p-0 hover:underline text-secondary-foreground font-normal">
            2. Interop Transaction Fees
          </AccordionTrigger>
          <AccordionContent className="mt-6 mb-6">
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>
                Primary metric: X ETH / Month transaction fees generated from
                transactions that interact with the{" "}
                <ExternalLink
                  href="https://docs.optimism.io/interop/message-passing"
                  className="underline"
                >
                  L2ToL2CrossDomainMessenger
                </ExternalLink>{" "}
                contract
              </li>
              <li>
                Secondary metric: % share of interop transaction fees v.s.
                non-interop
              </li>
            </ul>
            <p className="mt-6">
              <span className="font-medium">Why this metric?</span> The total
              fees spent on interoperable transactions maps to usage of feature
              after launch, and is a good indicator of the net growth caused by
              introducing the feature to the Superchain. This may not may not be
              measurable until full interop launches in late Q4.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  callout: [
    <GrantInfoCallout
      key="budget"
      title="Budget this season"
      description="9M OP"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="apply-by"
      title="Apply by"
      description="Sep 30, 2025"
      icon={<Calendar fill="#3374DB" />}
    />,
  ],
  showSupportedNetworks: true,
  status: "ongoing",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-07-01T00:00:00.000Z"),
  endsAt: new Date("2025-09-30T00:00:00.000Z"),
  applyBy: new Date("2025-09-30T00:00:00.000Z"),
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
          My project aligns with Interop TVL or Interop TX fees
        </p>
      ),
      type: "required",
    },
  ],
  footer: <div className="bg-secondary h-[2px] mt-5 mb-5" />,
  learnMoreLinks: [
    {
      title: "S8 Governance Fund Missions",
      href: "https://gov.optimism.io/t/s8-governance-fund-missions/10004?u=gonna.eth",
    },
    {
      title: "Collective grant policy",
      href: "https://gov.optimism.io/t/collective-grant-policies/5833",
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
          My project aligns with Interop TVL or Interop TX fees
        </p>
      ),
      type: "alignsWithInteropMetrics",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title: (
        <>
          Submit application via the{" "}
          <ExternalLink
            href="https://app.charmverse.io/op-grants/optimism-grants-council-8323028890716944"
            className="underline"
          >
            Grants Council (GC) website
          </ExternalLink>
        </>
      ),
      description:
        "On the application, inform Grants Council of your plan for growth, including milestones and KPIs.",
    },
    {
      number: 2,
      title:
        "Grants Council reviews the application and decides whether to approve or reject",
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
      imageUrl: "/assets/images/application-category-1.png",
      rewardAmount: "265K",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
    {
      name: "Moonwell",
      description:
        "Moonwell is an open and decentralized lending and borrowing protocol built on Base.",
      imageUrl: "/assets/images/application-category-2.png",
      rewardAmount: "265K",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
  ],
  supportOptions: [
    {
      type: "telegram",
      title: "Telegram",
      description: "Reach out anytime.",
      buttonText: "Join channel",
      buttonLink: "https://t.me/+CCkKpqGJouk5ZjYx",
      externalLink: true,
    },
    {
      type: "office-hours",
      title: "Office Hours",
      description: "Mondays at 10AM UTC.",
      buttonText: "Add to calendar",
      buttonLink: "#",
    },
  ],
}
