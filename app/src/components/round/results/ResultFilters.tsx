"use client"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/common/Button"
import DropdownItem from "@/components/common/DropdownItem"
import ExtendedLink from "@/components/common/ExtendedLink"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "../../ui/input"

const options = [
  { label: "Highest rewards", state: "desc" },
  { label: "Lowest rewards", state: "asc" },
]

const resultsCalculationOptions = [
  {
    label: " Round 4",
    link: "https://github.com/ethereum-optimism/op-analytics/tree/main/rpgf/rpgf4",
  },
  {
    label: " Round 5",
    link: "https://github.com/ethereum-optimism/op-analytics/tree/main/rpgf/rpgf5",
  },
]

interface ResultFiltersProps {
  setSearchText: Dispatch<SetStateAction<string>>
  searchText: string
  sortByAmount: "asc" | "desc"
  setSortByAmount: Dispatch<SetStateAction<"asc" | "desc">>
}
const ResultFilters: React.FC<ResultFiltersProps> = ({
  searchText,
  setSearchText,
  sortByAmount,
  setSortByAmount,
}) => {
  const handleSortOptionChange = (state: string) => {
    setSortByAmount(state as "asc" | "desc")
  }

  return (
    <div className="flex flex-row gap-2 mt-4">
      <div className="input-container text-inherit">
        <Search className="mr-2 h-4 w-4" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search projects..."
          className="flex bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-offset-0"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" as="dropdown">
            {options.find((option) => option.state === sortByAmount)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end" side="bottom">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              className="text-sm font-normal"
              checked={sortByAmount === option.state}
              key={option.label}
              onCheckedChange={(checked) =>
                checked && handleSortOptionChange(option.state)
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" as="dropdown">
            View results calculation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-40">
          {resultsCalculationOptions.map((option) => (
            <DropdownItem key={option.label}>
              <ExtendedLink
                href={option.link}
                text={option.label}
                showUnderline={false}
              />
            </DropdownItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ResultFilters
