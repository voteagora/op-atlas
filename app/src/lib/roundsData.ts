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
  startsAt: Date
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

export const ROUNDS: FundingRound[] = [
  {
    pageName: "retro-funding-dev-tooling",
    name: "Dev Tooling",
    number: 8,
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
    status: "ongoing",
    resultsLink: "/round/results/6",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/Frame 2485.png",
    startsAt: new Date("2025-02-01T21:53:13.300Z"),
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
    number: 7,
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
]
