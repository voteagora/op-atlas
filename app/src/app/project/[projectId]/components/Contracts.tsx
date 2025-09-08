"use client"

import { ProjectContract } from "@prisma/client"
import { ChevronDown, CoinsIcon } from "lucide-react"
import React from "react"

import { CHAIN_INFO } from "@/components/common/chain"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ContractsProps {
  contracts?: ProjectContract[]
}

export default function Contracts({ contracts }: ContractsProps) {
  const [loadedContracts, setLoadedContracts] = React.useState(
    contracts?.slice(0, 5) ?? [],
  )

  if (!contracts?.length) {
    return null
  }

  const loadMoreCount =
    contracts.length - loadedContracts.length >= 5
      ? 5
      : contracts.length - loadedContracts.length

  if (contracts.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <h4 className="font-normal text-xl">Contracts</h4>
      <ul className="space-y-2 pl-6">
        {loadedContracts.map((contract, index) => {
          const chain = CHAIN_INFO[contract.chainId]
          return (
            <li key={index} className="flex space-x-2 items-center">
              <Avatar className="w-6 h-6">
                <AvatarImage src={chain.logo} />
                <AvatarFallback className="p-1">
                  <CoinsIcon size={24} />
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground">
                {contract.contractAddress}
              </span>
            </li>
          )
        })}
      </ul>
      {loadedContracts.length >= contracts.length ? null : (
        <button
          className="flex items-center space-x-2 text-secondary-foreground font-normal text-sm"
          onClick={() => {
            setLoadedContracts(
              contracts.slice(0, loadedContracts.length + loadMoreCount),
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
