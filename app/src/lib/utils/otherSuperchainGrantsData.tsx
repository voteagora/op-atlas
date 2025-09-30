export interface SuperchainGrant {
  id: string
  name: string
  description: string
  chain: string
  avatar: string
  learnMoreUrl: string
}

export const superchainGrantsData: SuperchainGrant[] = [
  {
    id: "soneium-for-all",
    name: "Soneium For All",
    description:
      "Access help with funding, user acquisition, and technical implementation on Sonium.",
    chain: "Sonium",
    avatar: "/assets/chain-logos/Soneium.png",
    learnMoreUrl: "https://docs.soneium.org/docs/builders/sfa",
  },
  {
    id: "unichain-infinite-hackathon",
    name: "Unichain Infinite Hackathon",
    description:
      "Rewards for projects recently built during any hackathon (IRL or virtual), competition, or demo day.",
    chain: "Unichain",
    avatar: "/assets/chain-logos/Unichain.png",
    learnMoreUrl: "https://share.hsforms.com/113Gp09xPRbeZl5EKkDo93Qsdca9",
  },
  {
    id: "unichain-open-call",
    name: "Unichain Open Call",
    description:
      "For projects and teams looking for varying levels of support from the Uniswap Foundation.",
    chain: "Unichain",
    avatar: "/assets/chain-logos/Unichain.png",
    learnMoreUrl: "https://share.hsforms.com/1br6jbotQSvussdlWepfayQsdca9",
  },
  {
    id: "unichain-retro-grants",
    name: "Unichain Retro Grants",
    description:
      "For developers, content creators, and analysts with projects that show measurable impact.",
    chain: "Unichain",
    avatar: "/assets/chain-logos/Unichain.png",
    learnMoreUrl: "https://share.hsforms.com/1vZfQM5elQD-JSFCtwVLZhQsdca9",
  },
  {
    id: "world-foundation-grants",
    name: "World Foundation Grants",
    description:
      "Supporting innovation, impact, and collaboration on Worldchain.",
    chain: "Worldchain",
    avatar: "/assets/chain-logos/worldchain.png",
    learnMoreUrl: "https://world.org/grants",
  },
  {
    id: "world-foundation-rfps",
    name: "World Foundation RFPs",
    description:
      "Open calls for applications addressing specific focus areas for Worldchain growth.",
    chain: "Worldchain",
    avatar: "/assets/chain-logos/worldchain.png",
    learnMoreUrl: "https://world.org/rfp",
  },
]
