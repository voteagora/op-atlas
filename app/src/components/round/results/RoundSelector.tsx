"use client"

import { ChevronDown } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const availableRounds = [
  { id: "4", label: "Round 4: Onchain Builders", year: 2024 },
  { id: "5", label: "Round 5: OP Stack", year: 2024 },
  { id: "6", label: "Round 6: Governance", year: 2024 },
  { id: "7", label: "Retro Funding: Dev Tooling", year: 2025 },
  {
    id: "8",
    label: "Retro Funding: Onchain Builders",
    year: 2025,
  },
]

const RoundSelector = ({
  selectedRounds,
  setSelectedRounds,
  totalCount,
}: {
  selectedRounds: string[]
  setSelectedRounds:
    | Dispatch<SetStateAction<string[]>>
    | ((rounds: string[]) => void)
  totalCount: number
}) => {
  const toggleRound = (round: string) => {
    const nextRounds = selectedRounds.includes(round)
      ? selectedRounds.filter((r) => r !== round)
      : [...selectedRounds, round].sort((a, b) => parseInt(a) - parseInt(b))

    if (typeof setSelectedRounds === "function") {
      // If it's a URL updater, we call directly
      setSelectedRounds(nextRounds)
    }
  }

  const getRoundsText = () => {
    if (selectedRounds.length === 0) return "No rounds"
    if (selectedRounds.length === availableRounds.length)
      return "All rounds (since 2024)"

    const selectedLabels = availableRounds
      .filter((r) => selectedRounds.includes(r.id))
      .map((r) => `${r.label} (${r.year})`)

    let previewText = ""

    if (selectedLabels.length === 1) {
      previewText = selectedLabels[0]
    } else if (selectedLabels.length === 2) {
      previewText = selectedLabels.join(" and ")
    } else {
      return `${selectedLabels.length} rounds selected`
    }

    return previewText.length > 80
      ? `${previewText.slice(0, 77)}...`
      : previewText
  }

  return (
    <h1 className="text-xl font-normal mt-10">
      <span className="text-muted-foreground">
        {totalCount} {totalCount === 1 ? "project" : "projects"} rewarded in{" "}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1 font-normal outline-none ring-0">
          {getRoundsText()} <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            key="all"
            checked={selectedRounds.length === availableRounds.length}
            onCheckedChange={() => {
              const allIds = availableRounds.map((r) => r.id)
              setSelectedRounds(
                selectedRounds.length === availableRounds.length ? [] : allIds,
              )
            }}
          >
            All rounds (since 2024)
          </DropdownMenuCheckboxItem>
          {availableRounds.map((round) => (
            <DropdownMenuCheckboxItem
              key={round.id}
              checked={selectedRounds.includes(round.id)}
              onCheckedChange={() => toggleRound(round.id)}
            >
              {round.label} ({round.year})
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </h1>
  )
}

export default RoundSelector
