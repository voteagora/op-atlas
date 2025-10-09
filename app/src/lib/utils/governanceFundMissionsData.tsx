import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"

import { MissionData } from "../MissionsAndRoundData"

export const governanceFundMissionsData: MissionData = {
  pageName: "governance-fund-missions",
  name: "Governance Fund Missions",
  number: 10,
  roundName: "Governance Fund Missions",
  funding: {
    op: "388K",
  },
  season: "8",
  details: [
    <p key="govFund-details-1">
      Governance Fund Missions authored by the{" "}
      <ExternalLink
        className="underline"
        href="https://gov.optimism.io/t/optimism-governance-glossary/9407#p-42417-developer-advisory-board-5"
      >
        Developer Advisory Board
      </ExternalLink>{" "}
      address specific challenges core to Optimism&apos;s vision and strategy.
    </p>,
  ],
  shortDescription:
    "For self-sufficient teams interested in technical challenges.",
  ogDescription:
    "Governance Fund Missions authored by the Developer Advisory Board address specific challenges core to Optimism's vision and strategy.",
  status: "ongoing",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-08-15T00:00:00.000Z"),
  endsAt: new Date("2025-12-31T00:00:00.000Z"),
  applyBy: new Date("2025-12-31T00:00:00.000Z"),
  evaluationMonth: 9,
  callout: [
    <GrantInfoCallout
      key="best-for"
      title="Best for"
      description="Technical teams"
      icon="/assets/icons/user.svg"
    />,
    <GrantInfoCallout
      key="season-budget"
      title="Season budget"
      description="388K OP"
      icon="/assets/icons/op-icon.svg"
    />,
  ],
  showSupportedNetworks: false,
  applicationPageEligibility: [],
  missionPageEligibility: [],
  howItWorks: [
    {
      number: 1,
      title: "Explore open missions on the forum",
      description:
        "Learn about Mission Requests by reviewing the relevant posts.",
      subDetails: "Visit forum",
      subDetailsLink: "https://gov.optimism.io/tag/mission-request",
    },
    {
      number: 2,
      title:
        "Apply by completing the form in the expandable section of the post",
      description: "Submit your form as a comment in the thread.",
    },
    {
      number: 3,
      title: "The DAB announce recipients via the forum post comment section",
      description:
        "Each mission has its own deadline for announcing recipients.",
    },
    {
      number: 4,
      title: "Grant winner gets contacted by the Foundation",
      description:
        "They are required to undergo KYC and sign a grant agreement.",
    },
    {
      number: 5,
      title: "Grant is delivered to a locked multisig",
      description:
        "Within 1 week of KYC completion and Grant Agreement signature.",
    },
  ],
  learnMoreLinks: [
    {
      title: "Collective Grant Policy",
      href: "https://gov.optimism.io/t/collective-grant-policies/5833",
    },
  ],
}
