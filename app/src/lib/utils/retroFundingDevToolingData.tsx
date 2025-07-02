import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"

export const retroFundingDevToolingData: MissionData = {
  pageName: "retro-funding-dev-tooling",
  name: "Retro Funding: Dev Tooling",
  number: 7,
  roundName: "S8 Dev Tooling",
  funding: {
    op: "Up to 3.5M",
  },
  season: "8",
  details: [
    "Retro Funding: Dev Tooling rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain. This program is for software projects that have already launched and can prove their impact.",
    "Projects can enter the program at anytime during the season. Apply by the monthly application deadline (usually the third Friday of each month), and your project will be evaluated for rewards starting the following month.",
    "Impact is assessed monthly, and rewards are delivered monthly. ",
  ],
  ogDescription:
    "Retro Funding: Dev Tooling is distributing up to 8M OP in H1 2025. If you built tooling on Optimism, sign up to check if you qualify for grants.",
  callout: [
    <GrantInfoCallout
      key="best-for"
      title="Best for"
      description="Toolchain software"
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
  status: "ongoing",
  resultsLink: "/round/results?rounds=7",
  iconUrl: "/assets/images/dev-tooling.png",
  startsAt: new Date("2025-08-01T00:00:00.000Z"),
  endsAt: new Date("2025-08-31T00:00:00.000Z"),
  applyBy: (() => {
    return getCutoffDate()
  })(),
  evaluationMonth: (() => {
    const today = new Date()
    return today.getDate() > 27 ? (today.getMonth() + 1) % 12 : today.getMonth()
  })(),
  missionPageEligibility: [
    {
      reactNode: (
        <p className="text-secondary-foreground">My project is Open Source</p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project has a public GitHub repo with a history of commits
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          I am able to verify ownership over my project by adding a file to the
          root of the GitHub repo
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground">
          My project has JavaScript and/or Rust packages published on relevant
          registries (e.g, npm or crates.io) with their associated GitHub repo
          verified in OP Atlas (optional)
        </p>
      ),
      type: "optional",
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
      title: "Apply to Retro Funding: Dev Tooling",
      description:
        "In the upper right of this page, choose projects and submit your application.",
    },
    {
      number: 3,
      title: "Get notified of monthly reward results",
      description: "Rewards are based on your project's performance.",
    },
    {
      number: 4,
      title: "Complete KYC and claim grant",
      description: "TODO: ",
    },
  ],
  featuredProjects: [
    {
      name: "Solidity",
      description:
        "Solidity is an object-oriented, high-level language for implementing smart contracts.",
      imageUrl: "/assets/images/application-category-1.png",
      rewardAmount: "275K",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
    {
      name: "Solidity",
      description:
        "Solidity is an object-oriented, high-level language for implementing smart contracts.",
      imageUrl: "/assets/images/application-category-1.png",
      rewardAmount: "275K",
      rewardIcon: "/assets/icons/op-icon.svg",
    },
  ],
  supportOptions: [
    {
      type: "form",
      title: "Contact us",
      description: "Someone from the Retro Funding Team will respond asap.",
      buttonText: "Open form",
      buttonLink:
        "https://docs.google.com/forms/d/e/1FAIpQLSdU_cgpwqKWY5lRwgLzqCHt0-X3aKGsZVX1WnpiJeHhEiNwCg/viewform",
      buttonIcon: "/assets/icons/form-icon.svg",
    },
  ],
  applicationPageEligibility: [
    {
      reactNode: (
        <p className="text-secondary-foreground">
          All applications must verify ownership of GitHub repo(s) in OP Atlas.
        </p>
      ),
      type: "hasCodeRepositories",
    },
    {
      reactNode: (
        <p className="text-secondary-foreground flex-1">
          JavaScript and Rust packages must be published on package registries
          (e.g,{" "}
          <ExternalLink className="underline" href={"https://npmjs.org"}>
            npm
          </ExternalLink>{" "}
          or{" "}
          <ExternalLink className="underline" href={"https://crates.io"}>
            crates.io
          </ExternalLink>
          ) with their associated Github repo verified in OP Atlas.
        </p>
      ),
      type: "hasJavaScriptAndOrRustPackages",
    },
  ],
  rewards: {
    measurement: (
      <p className="text-secondary-foreground">
        Your impact will be measured via an evaluation algorithm powered by
        GitHub, npm, Crates, and Onchain data. The{" "}
        <ExternalLink href="#">evaluation algorithm</ExternalLink> will evolve
        throughout this Retro Funding Mission based on feedback from Optimism
        Citizens.
      </p>
    ),
    criteria: [
      "Adoption of Dev Tool by onchain builders",
      `Importance of the tool in onchain application development`,
      "Features that support superchain interop adoption among builders",
    ],
  },
}
