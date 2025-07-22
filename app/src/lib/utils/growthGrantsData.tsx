import React from "react"

import ExternalLink from "@/components/ExternalLink"
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
        href="https://gov.optimism.io/t/season-8-intent/10009"
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
          <AccordionTrigger className="text-base p-0 hover:underline text-foreground font-normal">
            1. Interop-ready TVL
          </AccordionTrigger>
          <AccordionContent className="mt-6 mb-6">
            <ul className="list-disc pl-4 space-y-1 text-base">
              <li className="text-secondary-foreground">
                Primary metric: TVL/AOP that is interop ready within the Interop
                Set
              </li>
              <li className="text-secondary-foreground">
                Secondary metric: Percent (%) share of TVL/AOP within the
                Interop Set that&apos;s interop ready v.s. total TVL/AOP
              </li>
            </ul>
            <p className="mt-6 text-secondary-foreground">
              <span className="font-medium text-foreground">
                Why this metric?
              </span>{" "}
              <ExternalLink
                href="https://docs.optimism.io/interop/explainer"
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
          <AccordionTrigger className="text-base p-0 hover:underline text-foreground font-normal">
            2. Interop Transaction Fees
          </AccordionTrigger>
          <AccordionContent className="mt-6 mb-6">
            <ul className="list-disc pl-4 space-y-1 text-base">
              <li className="text-secondary-foreground">
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
              <li className="text-secondary-foreground">
                Secondary metric: % share of interop transaction fees v.s.
                non-interop
              </li>
            </ul>
            <p className="mt-6 text-secondary-foreground">
              <span className="font-medium text-foreground">
                Why this metric?
              </span>{" "}
              The total fees spent on interoperable transactions maps to usage
              of feature after launch, and is a good indicator of the net growth
              caused by introducing the feature to the Superchain. This may not
              may not be measurable until full interop launches in late Q4.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  showSupportedNetworks: true,
  status: "ongoing",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-08-15T00:00:00.000Z"),
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
      title: "Submit your application via the Grants Council website",
      description:
        "Inform the council of your plan for growth, including milestones and KPIs.",
      subDetails: "Visit site",
      subDetailsLink:
        "https://app.charmverse.io/op-grants/optimism-grants-council-8323028890716944",
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
}
