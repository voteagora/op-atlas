"use client"
import { ChevronDown, CoinsIcon } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Contracts() {
  const [loadedContracts, setLoadedContracts] = React.useState(
    CONTRACTS.slice(0, 5),
  )
  const loadMoreCount =
    CONTRACTS.length - loadedContracts.length >= 5
      ? 5
      : CONTRACTS.length - loadedContracts.length

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case "Optimism":
        return "/assets/chain-logos/optimism.svg"
      case "Ethereum":
        return "/assets/chain-logos/ethereum.svg"
      case "Polygon":
        return "/assets/chain-logos/polygon.svg"
      default:
        return ""
    }
  }
  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Contracts</h4>
      <ul className="space-y-2 pl-6">
        {loadedContracts.map((contract, index) => (
          <li key={index} className="flex space-x-2 items-center">
            <Avatar className="w-6 h-6">
              <AvatarImage src={getChainIcon(contract.chain)} />
              <AvatarFallback className="p-1">
                <CoinsIcon size={24} />
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground">{contract.address}</span>
          </li>
        ))}
      </ul>
      {loadedContracts.length >= CONTRACTS.length ? null : (
        <button
          className="flex items-center space-x-2 text-secondary-foreground font-medium text-sm"
          onClick={() => {
            setLoadedContracts(
              CONTRACTS.slice(0, loadedContracts.length + loadMoreCount),
            )
          }}
        >
          <span>Load {loadMoreCount} more</span>
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  )
}

// TODO: Replace this with actual data
const CONTRACTS = [
  {
    address: "0x1234567890",
    chain: "Optimism",
  },
  {
    address: "0x1234567890",
    chain: "Ethereum",
  },
  {
    address: "0x1234567890",
    chain: "Polygon",
  },
]
//
