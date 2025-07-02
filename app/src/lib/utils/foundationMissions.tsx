import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"

export const foundationMissionsData: MissionData = {
  pageName: "foundation-missions",
  name: "Foundation Missions",
  number: 10,
  roundName: "S8 Foundation Missions",
  funding: {
    op: "Up to 3.5M",
  },
  season: "8",
  details: [
    "Ready to make an impact? Foundation Missions address specific challenges identified by the Optimism Foundation. These challenges are core to Optimism’s vision and strategy. Whether you’re a developer, designer, or just passionate about making a difference, there’s a place for you to contribute.",
  ],
  ogDescription:
    "Ready to make an impact? Foundation Missions address specific challenges identified by the Optimism Foundation. These challenges are core to Optimism’s vision and strategy. Whether you’re a developer, designer, or just passionate about making a difference, there’s a place for you to contribute.",
  status: "ongoing",
  resultsLink: "/round/results?rounds=8",
  iconUrl: "/assets/images/onchain-builders.png",
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
  ],
  showSupportedNetworks: false,
  howItWorks: [
    {
      number: 1,
      title: "Explore open opportunities on GitHub",
      description: "We'Learn about Mission Requests by reviewing the issues.",
    },
    {
      number: 2,
      title:
        "Apply by completing the form in the expandable section of the issue",
      description: "Submit your form as a comment in the issue thread.",
    },
    {
      number: 3,
      title: "Grant recipients are announced publicly via the GitHub Board",
      description:
        "Each mission has a selection date when recipients will be announced.",
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
  ]
}
