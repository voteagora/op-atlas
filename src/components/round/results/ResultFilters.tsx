"use client"
import { Search } from "lucide-react"
import Image from "next/image"
import { Dispatch, SetStateAction, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "../../ui/input"

const options = [
  { label: "Highest rewards", state: "desc" },
  { label: "Lowest rewards", state: "asc" },
]

const projectRoundOptions = [
  { label: "Round 4", state: "Round4", disabled: false },
  { label: "Round 5", state: "Round5", disabled: true },
  { label: "Round 6", state: "Round6", disabled: true },
  { label: "Round 7", state: "Round7", disabled: true },
]

interface ResultFiltersProps {
  setSearchText: Dispatch<SetStateAction<string>>
  searchText: string
  sortByAmount: "asc" | "desc"
  setSortByAmount: Dispatch<SetStateAction<"asc" | "desc">>
  setProjectRound: Dispatch<SetStateAction<string>>
}
const ResultFilters: React.FC<ResultFiltersProps> = ({
  searchText,
  setSearchText,
  sortByAmount,
  setSortByAmount,
  setProjectRound,
}) => {
  const [activeProjectRoundOption, setActiveProjectRoundOption] = useState<
    string | null
  >(projectRoundOptions[0].state)

  const handleSortOptionChange = (state: string) => {
    setSortByAmount(state as "asc" | "desc")
  }

  const handleProjectRoundChange = (state: string) => {
    setActiveProjectRoundOption(state)
    setProjectRound(state)
  }

  return (
    <div className="flex flex-row gap-2 mt-10">
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
        <DropdownMenuContent className="w-40">
          <DropdownMenuLabel className="text-sm font-semibold">
            Sort by
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
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
            Show projects from{" "}
            {
              projectRoundOptions.find(
                (projectRoundOption) =>
                  projectRoundOption.state === activeProjectRoundOption,
              )?.label
            }
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              height={8}
              width={10}
              alt="Arrow up"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel className="text-sm font-semibold">
            Show projects from
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projectRoundOptions.map((projectRoundOption) => (
            <DropdownMenuCheckboxItem
              className="text-sm font-normal"
              checked={activeProjectRoundOption === projectRoundOption.state}
              key={projectRoundOption.label}
              onCheckedChange={(checked) =>
                checked && handleProjectRoundChange(projectRoundOption.state)
              }
              disabled={projectRoundOption.disabled}
            >
              {projectRoundOption.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ResultFilters
