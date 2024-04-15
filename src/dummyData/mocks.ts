export type FundingRound = {
  number: number
  name: string
  details: string
  status: "now" | "upcoming" | "past"
  accentColor?: string
  iconUrl?: string
  startsAt: Date
  endsAt?: Date
}

export const FUNDING_ROUNDS: FundingRound[] = [
  {
    name: "Onchain Builders",
    number: 4,
    details:
      "This category will reward onchain builders who contribute to the success of Optimism. This round seeks to expand the...",
    status: "now",
    accentColor: "#F0F4FF",
    iconUrl: "/assets/images/sunny-violet.png",
    startsAt: new Date("2024-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-05-31T21:53:13.300Z"),
  },
  {
    name: "OP Stack",
    number: 5,
    details:
      "The OP Stack is the heart of Optimism, and the Superchain. Contributions to the OP Stack and improvements to the...",
    status: "upcoming",
    accentColor: "#FFF0F1",
    iconUrl: "/assets/images/sunny-red.png",
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
    iconUrl: "/assets/images/sunny-green.png",
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
    iconUrl: "/assets/images/sunny-orange.png",
    startsAt: new Date("2024-10-14T21:53:13.300Z"),
    endsAt: new Date("2023-05-31T21:53:13.300Z"),
  },
  {
    name: "Welcome, Optimists!",
    number: 3,
    details:
      "Supporting Optimism builders with developer tooling is the focus of this category. From SDKs to testing frameworks...",
    status: "past",
    startsAt: new Date("2023-10-01T21:53:13.300Z"),
    endsAt: new Date("2023-11-01T21:53:13.300Z"),
  },
  {
    name: "Welcome, Optimists!",
    number: 2,
    details:
      "Improving the capture resistance and resource allocation of Optimism Governance is the primary objective of this...",
    status: "past",
    startsAt: new Date("2023-05-14T21:53:13.300Z"),
    endsAt: new Date("2023-06-30T21:53:13.300Z"),
  },
  {
    name: "Welcome, Optimists!",
    number: 1,
    details:
      "The OP Stack is the heart of Optimism, and the Superchain. Contributions to the OP Stack and improvements to the...",
    status: "past",
    startsAt: new Date("2022-11-22T21:53:13.300Z"),
    endsAt: new Date("2023-01-01T21:53:13.300Z"),
  },
]
