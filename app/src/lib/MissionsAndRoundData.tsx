import React from "react"

import ExternalLink from "@/components/ExternalLink"
// import { VideoCallout } from "@/components/missions/common/callouts/VideoCallout"

export const rewardMeasurementDate = new Date("2025-03-10T21:53:13.300Z")

export type MissionData = FundingRoundData & {
  pageName: string
  ogDescription: string
  roundName: string
  missionPageRequirements: React.ReactNode
  missionPageEligibility: React.ReactNode
  applicationPageEligibility: { reactNode: React.ReactNode; type?: string }[]
  footer: React.ReactNode
  rewards: { measurement: string; criteria: string[] }
  applyBy: Date
}

export type FundingRoundData = {
  number: number
  name: string
  details: string
  status: "open" | "upcoming" | "past" | "ongoing"
  accentColor?: string
  link?: string
  resultsLink?: string
  iconUrl?: string
  startsAt: Date
  endsAt: Date
  funding?: {
    dollar?: string
    op?: string
    projects?: number
  }
}

export const MISSIONS: MissionData[] = [
  {
    pageName: "retro-funding-dev-tooling",
    name: "Dev Tooling",
    number: 7,
    roundName: "S7 Dev Tooling",
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
    ogDescription:
      "Retro Funding: Dev Tooling is distributing up to 8M OP in H1 2025. If you built tooling on Optimism, sign up to check if you qualify for grants.",
    status: "ongoing",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/dev-tooling.png",
    startsAt: new Date("2025-02-05T00:00:00.000Z"),
    endsAt: new Date("2025-07-31T00:00:00.000Z"),
    applyBy: new Date("2025-02-27T00:00:00.000Z"),
    missionPageEligibility: (
      <div>
        <ul className="list-disc pl-6">
          <li>
            <span className="font-semibold">All applications</span>{" "}
            <span className="text-secondary-foreground">
              must verify ownership of GitHub repo(s) in OP Atlas.
            </span>
          </li>
          <li>
            <span className="font-semibold">JavaScript</span>{" "}
            <span className="text-secondary-foreground">and </span>
            <span className="font-semibold">Rust packages</span>{" "}
            <span className="text-secondary-foreground">
              must be published on{" "}
            </span>
            <span className="font-semibold">package registries</span>{" "}
            <span className="text-secondary-foreground">
              (e.g,{" "}
              <ExternalLink className="underline" href={"https://npmjs.org"}>
                npm
              </ExternalLink>{" "}
              or{" "}
              <ExternalLink className="underline" href={"https://crates.io"}>
                crates.io
              </ExternalLink>
              ) with their associated Github repo verified in OP Atlas.
            </span>
          </li>
        </ul>
        {/* <div className="mt-6">
          <VideoCallout
            href="https://youtube.com"
            text="How to verify a Github repo in OP Atlas"
          />
        </div> */}
      </div>
    ),
    missionPageRequirements: (
      <div className="flex flex-col gap-4 my-6">
        <p>
          <span className="font-semibold">
            All projects must be Open Source.
          </span>{" "}
          <span className="text-secondary-foreground">
            They must have a public GitHub repository with a history of public
            commits.
          </span>
        </p>

        <p>
          <span className="font-semibold">JavaScript</span>{" "}
          <span className="text-secondary-foreground">and </span>
          <span className="font-semibold">Rust Packages</span>{" "}
          <span className="text-secondary-foreground">
            must be imported by at least three verified Superchain builder
            projects contributing 0.01 ETH in L2 gas fees within the past 6
            months.
          </span>
        </p>

        <p>
          <span className="font-semibold">Other Open Source Toolchains</span>{" "}
          <span className="text-secondary-foreground">
            must meet these requirements to earn rewards:
          </span>
        </p>

        <ol className="list-decimal pl-6">
          <li className="text-secondary-foreground">
            Must have at least one release on GitHub within the past 6 months.
          </li>
          <li className="text-secondary-foreground">
            Must show engagement from 10+ trusted developers (e.g., stars,
            forks, issues, or pull requests) verified using reputation
            algorithms like{" "}
            <ExternalLink href={"https://openrank.com/"} className="underline">
              OpenRank
            </ExternalLink>
            .
          </li>
        </ol>
      </div>
    ),
    footer: (
      <div>
        <div className="bg-secondary h-[2px] mt-5 mb-5" />
        <div>
          <span className="font-semibold pr-1">Learn more</span>
          <span className="text-secondary-foreground">
            in the{" "}
            <ExternalLink
              href="https://gov.optimism.io/t/season-7-retro-funding-missions/9295"
              className="underline"
            >
              Collective Governance Forum: Retro Funding Mission: Dev Tooling
            </ExternalLink>
          </span>
        </div>
      </div>
    ),
    applicationPageEligibility: [
      {
        reactNode: (
          <p className="text-secondary-foreground">
            All applications must verify ownership of GitHub repo(s) in OP
            Atlas.
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
      measurement:
        "Your impact will be measured via an evaluation algorithm powered by GitHub, npm, Crates, and Onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
      criteria: [
        "Adoption of Dev Tool by onchain builders",
        `Importance of the tool in onchain application development`,
        "Features that support superchain interop adoption among builders",
      ],
    },
  },
  {
    pageName: "retro-funding-onchain-builders",
    name: "Onchain Builders",
    number: 8,
    roundName: "S7 Onchain Builders",
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "rewards projects that drive cross-chain asset transfers, enabled through interop, by growing the Superchain across eligible OP Chains.",
    ogDescription:
      "Retro Funding: Onchain Builders is allocating up to 8M OP in H1 2025. If you've built on Optimism, sign up to see if you qualify for grants.",
    status: "ongoing",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/onchain-builders.png",
    startsAt: new Date("2025-02-13T00:00:00.000Z"),
    endsAt: new Date("2025-07-31T00:00:00.000Z"),
    applyBy: new Date("2025-02-27T00:00:00.000Z"),
    missionPageEligibility: (
      <div>
        <p className="text-secondary-foreground">
          Applications must meet these criteria:
        </p>
        <ul className="list-decimal pl-6 py-6">
          <li>
            <span className="font-semibold">Onchain deployment:</span>{" "}
            <span className="text-secondary-foreground">
              Your project must have a verified contract on one of the following
              OP Chains: Arena Z, Base, Ethernity, Ink, Lisk, Metal L2, Mode, OP
              Mainnet, RACE, Shape, Superseed, Swellchain, Unichain,
              World Chain, Zora, Soneium, Polynomial, Mint, Bob.
            </span>
          </li>
          <li>
            <span className="font-semibold">Contract Verification:</span>{" "}
            <span className="text-secondary-foreground">
              To verify ownership of a contract, the deployer address of the
              contract must sign a message in the “Contracts” step of project
              setup in OP Atlas.
            </span>
          </li>
          <li>
            <span className="font-semibold">Contract Attribution:</span>{" "}
            <span className="text-secondary-foreground">
              Contracts deployed by factories are attributed to the factory
              deployer. Contracts must have a single project owner applying for
              Retro Funding; overlapping claims are not allowed.
            </span>
          </li>
        </ul>
        {/* <VideoCallout
          href="https://youtube.com"
          text="How to verify onchain contracts in OP Atlas"
        /> */}

        <div className="flex flex-col gap-6 mt-6">
          <p className="text-secondary-foreground">
            To be considered for additional DeFi rewards, projects must meet
            these criteria:
          </p>
          <ol className="list-disc pl-6">
            <li>
              <span className="font-semibold">Adapter requirement:</span>{" "}
              <span className="text-secondary-foreground">
                DeFi projects must have a functioning{" "}
                <ExternalLink
                  className="underline"
                  href={"https://defillama.com/"}
                >
                  DefiLlama adapter.
                </ExternalLink>{" "}
                A link to the adaptor must be provided in in the “Contracts”
                step of project setup in OP Atlas.
              </span>
            </li>
          </ol>
          <p className="text-secondary-foreground">
            To be considered for additional Account Abstraction rewards,
            projects must meet these criteria:
          </p>
          <ol className="list-disc pl-6">
            <li>
              <span className="font-semibold">
                Operator registry requirement:
              </span>{" "}
              <span className="text-secondary-foreground">
                AA projects must be included in the{" "}
                <ExternalLink
                  href={"https://www.bundlebear.com/overview/all"}
                  className="underline"
                >
                  BundleBear
                </ExternalLink>{" "}
                operator registry (contract addresses verified in OP Atlas must
                be present in the registry). Add your project to the
                BundleBear-app in GitHub.
              </span>
            </li>
          </ol>
        </div>
      </div>
    ),
    missionPageRequirements: (
      <div className="flex flex-col gap-6 my-6">
        <p>
          <span className="font-semibold">All projects</span>{" "}
          <span className="text-secondary-foreground">
            must meet minimum activity requirements (measured over the last 180
            days) to earn rewards:
          </span>
        </p>

        <ul className="list-disc pl-6">
          <li className="text-secondary-foreground">
            At least 1000 transactions
          </li>
          <li className="text-secondary-foreground">
            At least 420 qualified addresses (ex: no bots)
          </li>
          <li className="text-secondary-foreground">
            At least 10 distinct days of onchain activity
          </li>
        </ul>

        <p>
          <span className="font-semibold">DeFi projects</span>{" "}
          <span className="text-secondary-foreground">
            can earn additional TVL rewards if they had at least $1M average TVL
            over the last 180 days.
          </span>
        </p>
      </div>
    ),
    footer: (
      <div>
        <div className="bg-secondary h-[2px] mt-5 mb-5" />
        <div>
          <span className="font-semibold pr-1">Learn more</span>
          <span className="text-secondary-foreground">
            in the{" "}
            <ExternalLink
              href="https://gov.optimism.io/t/season-7-retro-funding-missions/9295"
              className="underline"
            >
              Collective Governance Forum: Retro Funding Mission: Onchain
              Builders
            </ExternalLink>
          </span>
        </div>
      </div>
    ),
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
            . A link to the adaptor must be provided in in the “Contracts” step
            of project setup in OP Atlas.
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

    rewards: {
      measurement:
        "Your impact will be measured via an evaluation algorithm powered by onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
      criteria: [
        "Growth in Superchain adoption",
        `High-quality onchain value (e.g., TVL)`,
        "Interoperability support and adoption",
      ],
    },
  },
]

export const FUNDING_ROUNDS: FundingRoundData[] = [
  ...MISSIONS,
  {
    name: "Round 6: Governance",
    number: 6,
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this category. By incentivizing contributions that enhance governance tools, mechanisms, and processes, Retro Funding aims to foster a more robust and resilient governance framework within the ecosystem.",
    status: "past",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/round-6.svg",
    startsAt: new Date("2024-09-26T21:53:13.300Z"),
    endsAt: new Date("2024-10-14T21:53:13.300Z"),
  },
  {
    name: "Round 5: OP Stack",
    number: 5,
    funding: {
      op: "Up to 8M",
    },
    details:
      "Round 5 will reward OP Stack contributions. This includes direct contributions to the OP Stack, as well as its key dependencies. The round will reward impact which has been generated between October 2023 - July 2024. Impact will be rewarded within the following three categories: Ethereum Core Contributions, OP Stack Research & Development, and OP Stack Tooling. ",
    status: "past",
    resultsLink: "/round/results/5",
    accentColor: "#FFF0F1",
    iconUrl: "/assets/images/round-5-transparent.svg",
    startsAt: new Date("2024-08-14T21:53:13.300Z"),
    endsAt: new Date("2024-09-07T00:00:00.300Z"),
  },
  {
    name: "Round 4: Onchain Builders",
    number: 4,
    funding: {
      op: "10M",
    },
    details:
      "This category will reward onchain builders who contribute to the success of Optimism. This round seeks to expand the...",
    status: "past",
    link: "/projects/new",
    resultsLink: "/round/results/4",
    accentColor: "#F0F4FF",
    iconUrl: "/assets/images/round-4.svg",
    startsAt: new Date("2024-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-06T21:53:13.300Z"),
  },
  {
    name: "Round 3",
    number: 3,
    funding: {
      op: "30M",
      projects: 501,
    },
    link: "https://optimism.mirror.xyz/Bbu5M1mTNV2Z637QxOiF7Qt7R9hy6nxghbZiFbtZOBA",
    details:
      "Supporting Optimism builders with developer tooling is the focus of this category. From SDKs to testing frameworks...",
    status: "past",
    startsAt: new Date("2023-10-01T21:53:13.300Z"),
    endsAt: new Date("2023-11-01T21:53:13.300Z"),
  },
  {
    name: "Round 2",
    number: 2,
    funding: {
      op: "10M",
      projects: 195,
    },
    link: "https://optimism.mirror.xyz/7v1DehEY3dpRcYFhqWrVNc9Qj94H2L976LKlWH1FX-8",
    details:
      "Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this...",
    status: "past",
    startsAt: new Date("2023-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-30T21:53:13.300Z"),
  },
  {
    name: "Round 1",
    number: 1,
    funding: {
      dollar: "$1M",
      projects: 58,
    },
    details:
      "The OP Stack is the heart of Optimism, and the Superchain. Contributions to the OP Stack and improvements to the...",
    status: "past",
    startsAt: new Date("2022-11-22T21:53:13.300Z"),
    endsAt: new Date("2023-01-01T21:53:13.300Z"),
  },
]
