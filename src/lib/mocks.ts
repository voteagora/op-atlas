export type Project = Record<string, never>

export type FundingRound = {
  number: number
  name: string
  details: string
  status: "now" | "upcoming" | "past"
  accentColor?: string
  link?: string
  iconUrl?: string
  startsAt: Date
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
    status: "now",
    link: "/projects/new",
    accentColor: "#F0F4FF",
    iconUrl: "/assets/images/round-4.svg",
    startsAt: new Date("2024-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-06T21:53:13.300Z"),
  },
  {
    name: "OP Stack",
    number: 5,
    details:
      "The OP Stack is the heart of Optimism, and the Superchain. Contributions to the OP Stack and improvements to the...",
    status: "upcoming",
    accentColor: "#FFF0F1",
    iconUrl: "/assets/images/round-5.svg",
    startsAt: new Date("2024-08-14T21:53:13.300Z"),
    endsAt: new Date("2023-05-31T21:53:13.300Z"),
  },
  {
    name: "Governance",
    number: 6,
    details:
      "Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this...",
    status: "upcoming",
    accentColor: "#F0FFF1",
    iconUrl: "/assets/images/round-6.svg",
    startsAt: new Date("2024-09-14T21:53:13.300Z"),
    endsAt: new Date("2023-05-31T21:53:13.300Z"),
  },
  {
    name: "Dev Tooling",
    number: 7,
    details:
      "Supporting Optimism builders with developer tooling is the focus of this category. From SDKs to testing frameworks...",
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
