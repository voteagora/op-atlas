import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { CalendarEventFill, TimeFill } from "@/components/icons/remix"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"

export const retroFundingDevToolingData: MissionData = {
  pageName: "retro-funding-dev-tooling",
  name: "Dev Tooling",
  number: 7,
  roundName: "S8 Dev Tooling",
  funding: {
    op: "Up to 3.65M",
  },
  season: "8",
  details: [
    "Rewarding toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain. This program is for software projects that have already launched and can prove their impact.",
  ],
  shortDescription:
    "For tools that are already making an impact on the Superchain.",
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
      key="apply-by"
      title="Apply by"
      description="Monthly deadlines"
      icon={<CalendarEventFill fill="#3374DB" />}
    />,
    <GrantInfoCallout
      key="season-budget"
      title="Season budget"
      description="Up to 3.65M"
      icon="/assets/icons/op-icon.svg"
    />,
    <GrantInfoCallout
      key="season-timeline"
      title="Season timeline"
      description="Jul 31 - Dec 24, 2025"
      icon={<TimeFill fill="#3374DB" />}
    />,
  ],
  status: "ongoing",
  resultsLink: "/round/results?rounds=7",
  iconUrl: "/assets/images/dev-tooling.png",
  startsAt: new Date("2025-07-31T00:00:00.000Z"),
  endsAt: new Date("2025-12-24T00:00:00.000Z"),
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
          verified in OP Atlas
          <span className="text-xs px-2 py-0.5 text-callout-foreground bg-callout rounded-full inline-block ml-2 vertical-align-text-bottom">
            Optional
          </span>
        </p>
      ),
      type: "optional",
    },
  ],
  howItWorks: [
    {
      number: 1,
      title: "Create a project in Atlas where you'll connect your GitHub repos",
      description: "Complete all the steps and publish your project.",
      subDetails: "Add project",
      subDetailsLink: "/projects/new",
      enforceSignIn: true,
    },
    {
      number: 2,
      title: "Apply by the monthly deadline",
      description: "Choose projects and submit your application.",
    },
    {
      number: 3,
      title: "Earn monthly rewards",
      description: "Rewards are based on performance.",
    },
    {
      number: 4,
      title: "Verify your grant delivery address and complete KYC",
      description: "Proof of personhood is required to claim your rewards",
    },
    {
      number: 5,
      title: "Claim your rewards",
      description: "Rewards are streamed to your address via Superfluid.",
      subDetails: "About Superfluid",
      subDetailsLink: "https://superfluid.org/",
    },
  ],
  featuredProjects: [
    {
      name: "Solidity",
      description:
        "Solidity is an object-oriented, high-level language for implementing smart contracts.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/b6f312d0-1025-4a19-baa9-3aa218fe0833.png",
      rewardAmount: "356K OP",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xcc8d03e014e121d10602eeff729b755d5dc6a317df0d6302c8a9d3b5424aaba8",
    },
    {
      name: "Solady",
      description:
        "Solady is an open-source repository containing highly-optimized Solidity snippets. It offers efficient implementations of commonly-used libraries...",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/0e726459-df1e-4cea-bddb-25399f88acea.png",
      rewardAmount: "167K OP",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0x9151666888d0ca532a529be98a50d2eb992988117e202163f865fa9a27eb7149",
    },
    {
      name: "🏗️ Scaffold-ETH 2",
      description:
        "Scaffold-ETH 2 is an open-source toolkit for building decentralized applications on any EVM chain.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/f8efb7c2-8fb3-4988-8511-ae6e826b687f.png",
      rewardAmount: "136K OP",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0x154a42e5ca88d7c2732fda74d6eb611057fc88dbe6f0ff3aae7b89c2cd1666ab",
    },
    {
      name: "DefiLlama",
      description:
        "Open and transparent DeFi analytics. DEX meta-aggregator. LlamaZIp, a router optimized for optimistic rollups",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/a9e1e4b4-45a2-411b-8f31-059269534381.png",
      rewardAmount: "137K OP",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xae07bfec2c3c90937679f8c8c5c32e80407c09903aa03d1b5e5a075e67592b86",
    },
    {
      name: "Revm",
      description:
        "Revm is a critical component in the Ethereum ecosystem used by builders, toolings, clients and chains.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/57aeca37-e53b-4bcb-b161-0608d09e5c62.png",
      rewardAmount: "97.3K OP",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xb2d109759fe14e11ac5cc100ab6006321ebdd7ffdefbd2efac93a002105f8e92",
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
      externalLink: true,
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
        Your impact will be measured via an{" "}
        <ExternalLink
          href=" https://gov.optimism.io/t/evolution-of-retro-funding-in-season-8/10024"
          className="underline"
        >
          evaluation algorithm
        </ExternalLink>{" "}
        powered by GitHub, npm, Crates, and Onchain data. The evaluation
        algorithm will evolve throughout this Retro Funding Mission based on
        feedback from Optimism Citizens.
      </p>
    ),
    criteria: [
      "Adoption of Dev Tool by onchain builders",
      `Importance of the tool in onchain application development`,
      "Features that support superchain interop adoption among builders",
    ],
  },
  learnMoreLinks: [
    {
      title: "How Retro Funding Works",
      href: "https://community.optimism.io/citizens-house/how-retro-funding-works",
    },
    {
      title: "OP Tokenomics",
      href: "https://community.optimism.io/op-token/op-token-overview#op-tokenomics",
    },
    {
      title: "Retro Funding 2025",
      href: "https://optimism.mirror.xyz/zWlA9LROAzRee5BFqbquYHawmruKzLmXbONp_hcCwE4",
    },
  ],
}
