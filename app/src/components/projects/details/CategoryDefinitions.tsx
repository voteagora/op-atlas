const DEFINITIONS = [
  {
    category: "CeFi",
    value:
      "Centralized finance products including exchanges, trading, market-making platforms and others.",
  },
  {
    category: "Cross Chain",
    value:
      "Projects that facilitate cross chain communication or bridging assets across chains.",
  },
  {
    category: "DeFi",
    value:
      "Decentralized finance products including exchanges, lending, staking, insurance, real-world asset, indexes and others.",
  },
  {
    category: "Governance",
    value:
      "Projects that facilitate decentralized governance with community management, delegation, voting, etc.",
  },
  {
    category: "NFT",
    value: "NFT marketplaces, collections, NFT finance and others.",
  },
  {
    category: "Social",
    value:
      "Projects with a social component, including community, gaming, gambling, and media.",
  },
  {
    category: "Utility",
    value:
      "Projects related to tooling including dev tooling, middleware, identity tooling, account abstraction, payments, oracles and others.",
  },
]

export function CategoryDefinitions() {
  return (
    <div className="flex flex-col gap-4 py-4 text-secondary-foreground">
      {DEFINITIONS.map((def) => (
        <div key={def.category}>
          <span className="font-normal">{def.category}: </span>
          <span>{def.value}</span>
        </div>
      ))}
    </div>
  )
}
