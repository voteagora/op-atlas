import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { GrantInfoCallout } from "@/components/missions/common/callouts/GrantInfoCallout"
import { getCutoffDate } from "@/lib/utils"

import { MissionData } from "../MissionsAndRoundData"
import { Calendar } from "@/components/icons/calendar"

export const retroFundingOnchainBuildersData: MissionData = {
  pageName: "retro-funding-onchain-builders",
  name: "Onchain Builders",
  number: 8,
  roundName: "S7 Onchain Builders",
  funding: {
    op: "Up to 3.5M",
  },
  season: "8",
  details: [
    "Rewarding application developers for their contributions to Superchain growth and interop adoption. This program is for onchain applications that have seen significant adoption and can prove their impact.",
  ],
  ogDescription:
    "Rewarding application developers for their contributions to Superchain growth and interop adoption. This program is for onchain applications that have seen significant adoption and can prove their impact.",
  status: "ongoing",
  resultsLink: "/round/results?rounds=8",
  iconUrl: "/assets/images/onchain-builders.png",
  startsAt: new Date("2025-06-24T00:00:00.000Z"),
  endsAt: new Date("2025-12-30T00:00:00.000Z"),
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
      key="apply-by"
      title="Apply by"
      description="Monthly deadlines"
      icon={<Calendar fill="#3374DB" />}
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
          My project has deployed contracts on a{" "}
          <ExternalLink
            className="underline"
            href={"https://www.superchain.eco/chains"}
          >
            supported chain
          </ExternalLink>
        </p>
      ),
      type: "required",
    },
    {
      reactNode: (
        <>
          <p className="text-secondary-foreground">
            For DeFi, I can provide a link to a functioning{" "}
            <ExternalLink href="https://defillama.com" className="underline">
              DeFiLlama adaptor
            </ExternalLink>
            <span className="text-xs px-2 py-0.5 text-callout-foreground bg-callout rounded-full inline-block ml-2 vertical-align-text-bottom">
              Optional
            </span>
          </p>
        </>
      ),
      type: "extraRewards",
    },
    {
      reactNode: (
        <>
          <p className="text-secondary-foreground">
            For Account Abstraction, I&apos;ve added my project to the{" "}
            <ExternalLink
              href="https://www.bundlebear.com/overview/all"
              className="underline"
            >
              BundleBear-app in GitHub
            </ExternalLink>
            , and my verified contract addresses are present in the registry
            <span className="text-xs px-2 py-0.5 text-callout-foreground bg-callout rounded-full inline-block ml-2 vertical-align-text-bottom">
              Optional
            </span>
          </p>
        </>
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
      subDetailsLink:
        "https://help.superfluid.finance/en/articles/9128773-how-to-unwrap-your-optimism-prize",
    },
  ],
  rewards: {
    measurement: (
      <p className="text-secondary-foreground">
        Your impact will be measured via an{" "} 
        <ExternalLink
          href="https://gov.optimism.io/t/evolution-of-retro-funding-in-season-8/10024"
          className="underline"
        >
          evaluation algorithm
        </ExternalLink>{" "}               
        powered by
        onchain data. The evaluation algorithm
        will evolve throughout this Retro Funding Mission based on feedback from
        Optimism Citizens.
      </p>
    ),
    criteria: [
      "Growth in Superchain adoption",
      "High-quality onchain value (e.g., TVL)",
      "Interoperability support and adoption",
    ],
  },
  featuredProjects: [
    {
      name: "Velodrome",
      description: "The central trading & liquidity marketplace on Superchain",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/438ea57d-059c-4327-82e4-abfc94544bad.png",
      rewardAmount: "309K",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0x08df6e20a3cfabbaf8f34d4f4d048fe7da40447c24be0f3ad513db6f13c755dd",
    },
    {
      name: "Morpho",
      description:
        "Morpho is a decentralized lending platform that allows anyone to earn yield and borrow assets seamlessly",
      imageUrl:
        "https://cdn.charmverse.io/user-content/92e825ef-614d-4aaa-b3d7-cf7b4c793477/6c1b26d4-c05c-4c8d-91f9-ce0f077228d2/Morpho-logo-dark-shape-PP.png",
      rewardAmount: "221K",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xda8c593717693ef30f5c62fc2689709784324cfb9b5fe92c9db3a47f596791e5",
    },
    {
      name: "Virtuals Protocol",
      description: "AI Agent Intelligence Network on Base",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/a8b42e6b-a95c-4a2d-8403-570c275d187a.png",
      rewardAmount: "194K",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0x780cf3d5aa4e3c94b8a4157f4b06a3f92ebcc20813585e20e3fe0271bf76b7a9",
    },
    {
      name: "Stoke Fire",
      description:
        "Stoke Fire is a mobile game built on base and the farcaster social graph. Gather resources, raid your friends and stoke the fire to grow your population.",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/72d35628-aead-4ef8-a924-79d355735214.png",
      rewardAmount: "39.4K",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xfe8e35b3487bd0e0457b9431b12b73403ca1f5c9c19dd1db81a2317c97c1e1a2",
    },
    {
      name: "Bunni.xyz",
      description:
        "Bunni is the most advanced DEX ever built. Bunni maximizes LP profits in all market conditions using its first-of-its-kind Shapeshifting Liquidity",
      imageUrl:
        "https://storage.googleapis.com/op-atlas/2c2e4555-6e66-403d-bee1-1762797c1c61.png",
      rewardAmount: "19.7K",
      rewardIcon: "/assets/icons/op-icon.svg",
      href: "https://atlas.optimism.io/project/0xcc230da6ee8cbcc2d4039a526fbc8aa910d63201e350be2fae0cab9864194974",
    },
  ],
  supportOptions: [
    {
      type: "custom",
      title: "Contact us",
      description: "Someone from the Retro Funding Team will respond asap.",
      buttonText: "Open form",
      buttonLink:
        "https://docs.google.com/forms/d/e/1FAIpQLSdU_cgpwqKWY5lRwgLzqCHt0-X3aKGsZVX1WnpiJeHhEiNwCg/viewform",
      externalLink: true,
    },
  ],
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
