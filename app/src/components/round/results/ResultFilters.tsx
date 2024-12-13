"use client"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/ui/button"
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
      <div className="max-w[576px] w-full flex items-center border px-3 rounded-md">
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
          <Button
            variant="secondary"
            className="text-sm font-normal gap-2 text-muted-foreground focus-visible:ring-0"
          >
            {options.find((option) => option.state === sortByAmount)?.label}
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              height={8}
              width={10}
              alt="Arrow up"
            />
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
          <Button
            variant="secondary"
            className="text-sm font-normal gap-2 text-muted-foreground focus-visible:ring-0"
          >
            View results calculation
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              height={8}
              width={10}
              alt="Arrow up"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-40">
          {resultsCalculationOptions.map((option) => (
            <Link
              href={option.link}
              key={option.label}
              target="_blank"
              className="flex items-center gap-2 px-2 py-1 text-sm font-normal hover:bg-secondary rounded"
            >
              <span className="text-foreground">{option.label}</span>
              <Image
                src="/assets/icons/arrow-up-right.svg"
                height={8}
                width={8}
                alt="Arrow up right"
              />
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ResultFilters
