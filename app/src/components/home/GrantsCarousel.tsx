import { GrantContainer } from "./GrantContainer"

const grants = [
  {
    title: "Onchain Apps",
    description:
      "Grants for projects focused on DeFi, NFTs, gaming, or anything user-facing.",
    icon: "/assets/icons/dashboard-line.svg",
    links: [
      {
        label: "Retro Funding",
        url: "/missions/retro-funding-onchain-builders",
      },
      {
        label: "Grants Council Missions",
        url: "https://app.charmverse.io/op-grants/optimism-grants-council-8323028890716944",
      },
    ],
  },
  {
    title: "Developer Tooling and Infrastructure",
    description:
      "Grants for those creating tools, SDKs, APIs, or Superchain infrastructure.",
    icon: "/assets/icons/tools-fill.svg",
    links: [
      {
        label: "Retro Funding",
        url: "/missions/retro-funding-dev-tooling",
      },
      {
        label: "Foundation Missions",
        url: "https://github.com/orgs/ethereum-optimism/projects/31/views/1",
      },
    ],
  },
  {
    title: "Open Opportunities",
    description: "Get a grant to tackle problems that need solving. ",
    icon: "/assets/icons/terminal-line.svg",
    links: [
      {
        label: "Foundation Missions",
        url: "https://github.com/orgs/ethereum-optimism/projects/31/views/1",
      },
    ],
  },
]

export const GrantsCarousel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full py-8">
      {grants.map((grant, index) => (
        <div
          key={grant.title}
          className="md:border-b md:border-b-0 md:border-r last:border-r-0"
        >
          <GrantContainer {...grant} />
        </div>
      ))}
    </div>
  )
}
