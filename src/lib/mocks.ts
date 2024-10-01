export type FundingRound = {
  number: number
  name: string
  details: string
  status: "open" | "upcoming" | "past" | "ongoing"
  accentColor?: string
  link?: string
  resultsLink?: string
  iconUrl?: string
  startsAt: Date | string
  endsAt?: Date
  funding?: {
    dollar?: string
    op?: string
    projects?: number
  }
}

export const FUNDING_ROUNDS: FundingRound[] = [
  {
    name: "Onchain Builders",
    number: 4,
    funding: {
      op: "10M",
    },
    details:
      "This category will reward onchain builders who contribute to the success of Optimism. This round seeks to expand the...",
    status: "past",
    link: "/projects/new",
    resultsLink: "/round/results",
    accentColor: "#F0F4FF",
    iconUrl: "/assets/images/round-4.svg",
    startsAt: new Date("2024-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-06T21:53:13.300Z"),
  },
  {
    name: "OP Stack",
    number: 5,
    funding: {
      op: "Up to 8M",
    },
    details:
      "Round 5 will reward OP Stack contributions. This includes direct contributions to the OP Stack, as well as its key dependencies. The round will reward impact which has been generated between October 2023 - July 2024. Impact will be rewarded within the following three categories: Ethereum Core Contributions, OP Stack Research & Development, and OP Stack Tooling. ",
    status: "past",
    accentColor: "#FFF0F1",
    iconUrl: "/assets/images/round-5-transparent.svg",
    startsAt: new Date("2024-08-14T21:53:13.300Z"),
    endsAt: new Date("2024-09-07T00:00:00.300Z"),
  },
  {
    name: "Governance",
    number: 6,
    funding: {
      op: "Up to 3.5M",
    },
    details:
      "Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this category. By incentivizing contributions that enhance governance tools, mechanisms, and processes, Retro Funding aims to foster a more robust and resilient governance framework within the ecosystem.",
    status: "open",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/round-6.svg",
    startsAt: `Planned for ${new Date("2024-09-26T21:53:13.300Z")}`,
    endsAt: new Date("2024-10-10T21:53:13.300Z"),
  },
  {
    name: "Dev Tooling",
    number: 7,
    details:
      "Supporting Optimism builders with developer tooling is the focus of this category. From SDKs to testing frameworks, contributions that streamline the development process and empower builders will be rewarded, ensuring a more efficient and productive development environment.",
    status: "upcoming",
    accentColor: "#FFF6F0",
    iconUrl: "/assets/images/round-7.svg",
    startsAt: new Date("2024-10-14T21:53:13.300Z"),
    endsAt: new Date("2023-05-31T21:53:13.300Z"),
  },
  {
    name: "Welcome, Optimists!",
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
    name: "Welcome, Optimists!",
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
    name: "Welcome, Optimists!",
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
