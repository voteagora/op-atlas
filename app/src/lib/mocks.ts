export type FundingRound = {
  number: number
  pageName?: string
  name: string
  details: string
  status: "open" | "upcoming" | "past" | "ongoing"
  accentColor?: string
  link?: string
  resultsLink?: string
  iconUrl?: string
  startsAt?: Date
  endsAt?: Date
  applyBy?: Date
  funding?: {
    dollar?: string
    op?: string
    projects?: number
  }
  eligibility?: any
  rewards?: any
}

export const FUNDING_ROUNDS: FundingRound[] = [
  {
    pageName: "retro-funding-dev-tooling",
    name: "Dev Tooling",
    number: 7,
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
    status: "ongoing",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/Frame 2485.png",
    startsAt: new Date("2025-01-01T21:53:13.300Z"),
    endsAt: new Date("2025-06-30T21:53:13.300Z"),
    applyBy: new Date("2025-01-25T21:53:13.300Z"),
    eligibility: {
      criteria: [
        {
          name: "Open Source",
          description:
            "Projects must have a public GitHub repository with a history of public commits.",
        },
        {
          name: "Ownership of GitHub repo",
          description:
            "A funding.json file linked to the GitHub repository must verify ownership in OP Atlas.",
          videoLink: {
            text: "How to verify a GitHub repo in OP Atlas",
            link: "https://youtube.com",
            type: "video",
          },
          type: "hasCodeRepositories",
        },
      ],
      contextSpecificCriteria: [
        {
          name: "For JavaScript and Rust Packages",
          criteria: [
            {
              text: "Must be published on respective registries (e.g., npm or crates.io) with the associated Github repo verified in OP Atlas.",
              links: {
                npm: "https://www.npmjs.com",
                "crates.io": "https://crates.io",
              },
            },
            {
              text: "Must be imported by at least three verified Superchain builder projects contributing 0.01 ETH in L2 gas fees within the past 6 months.",
            },
          ],
        },
        {
          name: "For Other Open Source Toolchains",
          criteria: [
            {
              text: "Must have at least one release on GitHub within the past 6 months.",
            },
            {
              text: "Must show engagement from 10+ trusted developers (e.g., stars, forks, issues, or pull requests), verified using reputation algorithms like OpenRank.",
            },
          ],
        },
      ],
    },
    rewards: {
      measurement:
        "Your impact will be measured via an evaluation algorithm powered by Github, NPM, Crate, and Onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
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
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "rewards projects that drive cross-chain asset transfers, enabled through interop, by growing the Superchain across eligible OP Chains.",
    status: "ongoing",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/Frame 2486.png",
    startsAt: new Date("2025-02-01T21:53:13.300Z"),
    endsAt: new Date("2025-06-30T21:53:13.300Z"),
    applyBy: new Date("2025-01-25T21:53:13.300Z"),
    eligibility: {
      criteria: [
        {
          name: "Onchain deployment",
          description:
            "Your project must have a verified contract on one of the following OP Chains: Base, Ink, Lisk, Mode, OP Mainnet, Sonium, Unichain, Worldchain, Zora.",
        },
        {
          name: "Contract verification",
          description:
            "To verify ownership of a contract, the deployer address of the contract must sign a message in the “Contracts” step of project setup in OP Atlas.",
          videoLink: {
            text: "How to verify onchain contracts in OP Atlas",
            link: "https://youtube.com",
            type: "video",
          },
          type: "isOnChainContract",
        },
        {
          name: "Contract attribution",
          description:
            "Contracts deployed by factories are attributed to the factory deployer. Contracts must have a single project owner applying for Retro Funding; overlapping claims are not allowed.",
        },
        {
          name: "Transaction thresholds",
          description:
            "Projects must meet the following minimum activity requirements over the Retro Funding eligibility period:",
          criteria: [
            "At least 1000 transactions",
            "At least 420 qualified addresses",
            "10 distinct days of onchain activity",
          ],
        },
        {
          category: "DeFi projects",
          name: "TVL and Adaptor Requirement",
          description:
            "DeFi projects must have a DeFiLlama adaptor and an average Total Value Locked (TVL) of at least $1M during the eligibility period. A link to the adaptor must be provided in in the “Repos & Links” step of project setup in OP Atlas.",
          videoLink: {
            text: "How to build an adapter",
            link: "https://youtube.com",
            type: "document",
          },
          situational: true,
          links: {
            "DeFiLlama adaptor": "https://defillama.com/",
          },
        },
        {
          category: "Account abstraction",
          name: "Operator Registry Requirement",
          description:
            "The project must be included in the operator registry maintained by BundleBear. The address(es) verified in the application must also be present in the registry.",
          links: {
            BundleBear: "https://bundlebear.com/",
          },
          situational: true,
        },
      ],
    },
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
