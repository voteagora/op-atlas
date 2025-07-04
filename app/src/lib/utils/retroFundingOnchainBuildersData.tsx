import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"

export const retroFundingOnchainBuildersData: MissionData = {
  pageName: "retro-funding-onchain-builders",
  name: "Retro Funding: Onchain Builders",
  number: 8,
  roundName: "S7 Onchain Builders",
  funding: {
    op: "Up to 3.5M",
  },
  season: "8",
  details: [
    "Retro Funding: Onchain Builders rewards application developers for their contributions to Superchain growth and interop adoption. This program is for on-chain applications that have seen significant adoption and can prove their impact.",
    "Projects can enter the program at anytime during the season. Apply by the monthly application deadline (usually the third Friday of each month), and your project will be evaluated for rewards starting the following month.",
    "Impact is assessed monthly, and rewards are delivered monthly. ",
  ],
  ogDescription:
    "Retro Funding: Onchain Builders is allocating up to 8M OP in H1 2025. If you've built on Optimism, sign up to see if you qualify for grants.",
  status: "ongoing",
  resultsLink: "/round/results?rounds=8",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-02-18T00:00:00.000Z"),
  endsAt: new Date("2025-07-31T00:00:00.000Z"),
  applyBy: (() => {
    return getCutoffDate()
  })(),
  evaluationMonth: (() => {
    const today = new Date()
    return today.getDate() > 27 ? (today.getMonth() + 1) % 12 : today.getMonth()
  })(),
  callout: [
    <GrantInfoCallout
      key="best-for"
      title="Best for"
      description="Onchain apps"
      icon="/assets/icons/user.svg"
    />,
    <GrantInfoCallout
      key="up-to"
      title="Up to"
      description="250K OP"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="budget"
      title="Budget this season"
      description="9M OP"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="apply-by"
      title="Apply by"
      description="Monthly deadlines"
      icon="/assets/icons/calendar.svg"
    />,
  ],
  showSupportedNetworks: true,
  applicationPageEligibility: [
    {
      reactNode: (
        <p className="text-secondary-foreground">
          Contract verified on an eligible OP chain
        </p>
      ),
      type: "isOnChainContract",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          DeFi projects must have a functioning{" "}
          <ExternalLink className="underline" href={"https://defillama.com"}>
            DefiLlama adapter
          </ExternalLink>
          . A link to the adaptor must be provided in the &quot;Contracts&quot;
          project setup in OP Atlas.
        </p>
      ),
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          Account Abstraction projects must be included in the{" "}
          <ExternalLink
            className="underline"
            href={"https://www.bundlebear.com/overview/all"}
          >
            BundleBear
          </ExternalLink>{" "}
          operator registry (contract addresses verified in OP Atlas must be
          present in the registry).
        </p>
      ),
    },
  ],
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
          I can provide a link to a functioning DeFiLlama adaptor (optional)
        </p>
      ),
      type: "extraRewards",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          I&apos;ve added my project to the BundleBear-app in GitHub, and my
          verified contract addresses are present in the registry (optional)
        </p>
      ),
      type: "extraRewards",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title:
        "Create a project in Atlas to which you'll add your onchain contracts",
      description: "Complete all the steps and publish your project.",
    },
    {
      number: 2,
      title: "Apply to Retro Funding: Onchain Builders",
      description:
        "In the upper right of this page, choose projects and submit your application.",
    },
    {
      number: 3,
      title: "Get monthly rewards",
      description: "Rewards are based on your project's performance.",
    },
    {
      number: 4,
      title: "Complete KYC and claim grant",
      description: "TODO: ",
    },
  ],
  rewards: {
    measurement: (
      <p className="text-secondary-foreground">
        Your impact will be measured via an evaluation algorithm powered by
        onchain data. The{" "}
        <ExternalLink href="#">evaluation algorithm</ExternalLink> will evolve
        throughout this Retro Funding Mission based on feedback from Optimism
        Citizens.
      </p>
    ),
    criteria: [
      "Growth in Superchain adoption",
      "High-quality onchain value (e.g., TVL)",
      "Interoperability support and adoption",
    ],
  },
  supportOptions: [
    {
      type: "custom",
      title: "Contact us",
      description: "Someone from the Retro Funding Team will respond asap.",
      buttonText: "Open forum",
      buttonLink: "TODO: forum link",
    },
  ],
}
