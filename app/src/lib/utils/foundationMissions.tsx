import React from "react"

import { MissionData } from "../MissionsAndRoundData"

export const foundationMissionsData: MissionData = {
  pageName: "foundation-missions",
  name: "Foundation Missions",
  number: 10,
  roundName: "S8 Foundation Missions",
  funding: {
    op: "Up to 3.5M",
  },
  startsAt: new Date(),
  endsAt: new Date(),
  season: "8",
  details: [
    "Foundation Missions address specific challenges core to Optimism’s vision and strategy. Whether you’re a developer, designer, or just passionate about making a difference, there’s a place for you to contribute.",
  ],
  shortDescription: "For anyone who wants to tackle pre-determined problems.",
  ogDescription:
    "Foundation Missions address specific challenges core to Optimism’s vision and strategy. Whether you’re a developer, designer, or just passionate about making a difference, there’s a place for you to contribute.",
  status: "ongoing",
  resultsLink: "/round/results?rounds=8",
  iconUrl: "/assets/images/onchain-builders.png",
  applyBy: null,
  evaluationMonth: (() => {
    const today = new Date()
    return today.getDate() > 27 ? (today.getMonth() + 1) % 12 : today.getMonth()
  })(),
  showSupportedNetworks: false,
  howItWorks: [
    {
      number: 1,
      title: "Explore open opportunities on GitHub",
      description: "Learn about Mission Requests by reviewing the issues",
      subDetails: "Visit GitHub",
      subDetailsLink:
        "https://github.com/orgs/ethereum-optimism/projects/31/views/1",
    },
    {
      number: 2,
      title:
        "Apply by completing the form in the expandable section of the issue",
      description: "Submit your form as a comment in the issue thread.",
    },
    {
      number: 3,
      title: "Mission Request owners announce recipients via the GitHub Board",
      description:
        "Each mission has its own deadline for announcing recipients.",
    },
    {
      number: 4,
      title: "Grant winner gets contacted by the Foundation",
      description:
        "They are required to undergo KYC and sign a grant agreement",
    },
    {
      number: 5,
      title: "Grant is delivered to a locked multisig",
      description:
        "Within 1 week of KYC completion and Grant Agreement signature.",
    },
  ],
  supportOptions: [
    {
      type: "form",
      title: "Contact us",
      description:
        "Someone from the Foundation Missions Team will respond asap.",
      buttonText: "Open form",
      buttonLink:
        "https://docs.google.com/forms/d/e/1FAIpQLSdU_cgpwqKWY5lRwgLzqCHt0-X3aKGsZVX1WnpiJeHhEiNwCg/viewform",
      externalLink: true,
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
}
