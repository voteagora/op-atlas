import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"

export const auditGrantsData: MissionData = {
  pageName: "audit-grants",
  name: "Audit Grants",
  number: 10,
  roundName: "S8 Audit Grants",
  funding: {
    op: "Up to 3.5M",
  },
  season: "8",
  details: [
    "Audit Grants cover the cost of smart contract audits for apps across the Superchain. Grants are typically for pre-deployed apps preparing for launch, but are also available to established apps launching new features.",
  ],
  ogDescription:
    "Audit Grants cover the cost of smart contract audits for apps across the Superchain. Grants are typically for pre-deployed apps preparing for launch, but are also available to established apps launching new features.",
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
      key="budget"
      title="Budget this season"
      description="9M OP"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="apply-by"
      title="Apply by"
      description="Sep 30, 2025"
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
          . A link to the adaptor must be provided in the &quot;Contracts&quot; step of
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
          Project is deployed or planning to deploy on a supported chain
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          Project is a smart contract audit
        </p>
      ),
      type: "required",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title: "Project contacts an Audit Service Provider (ASP)",
      description: "We've whitelisted a number of reliable providers for you.",
    },
    {
      number: 2,
      title: "ASP applies for the Audit Grant on behalf of the Project",
      description:
        "The Grants Council typically responds to ASP applicants within a week.",
    },
    {
      number: 3,
      title: "The GC seeks approval from the Developer Advisory Board",
      description: "",
    },
  ],
  supportOptions: [
    {
      type: "telegram",
      title: "Telegram",
      description: "Reach out anytime.",
      buttonText: "Join channel",
      buttonLink: "https://t.me/optimismgrants",
    },
    {
      type: "office-hours",
      title: "Office Hours",
      description: "Mondays at 10AM UTC.",
      buttonText: "Add to calendar",
      buttonLink: "#",
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
  learnMoreLinks: [
    {
      title: "Grants Council audit hub",
      href: "#",
    },
    {
      title: "Collective grant policy",
      href: "#",
    },
  ],
}
