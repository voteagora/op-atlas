import React from "react"

import ExternalLink from "@/components/ExternalLink"
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
  startsAt: new Date("2025-08-15T00:00:00.000Z"),
  endsAt: new Date("2025-09-30T00:00:00.000Z"),
  applyBy: (() => {
    return getCutoffDate()
  })(),
  evaluationMonth: (() => {
    const today = new Date()
    return today.getDate() > 27 ? (today.getMonth() + 1) % 12 : today.getMonth()
  })(),
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
          step of project setup in OP Atlas.
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
          My project is deployed or has a clear plan to deploy on a supported
          chain.
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project&apos;s code is &quot;audit-ready&quot; (e.g., code is frozen, has tests
          and documentation)
        </p>
      ),
      type: "required",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title: "Contact an Audit Service Provider (ASP)",
      description: "We've whitelisted a number of reliable providers for you.",
      subDetails: "View ASPs",
      subDetailsLink:
        "https://app.charmverse.io/op-grants/audits-hub-759373059217642",
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
    {
      number: 4,
      title:
        "Upon grant approval, the ASP performs an audit to identify potential issues and recommend solutions",
    },
  ],
  learnMoreLinks: [
    {
      title: "Collective Grant Policy",
      href: "https://gov.optimism.io/t/collective-grant-policies/5833",
    },
  ],
}
