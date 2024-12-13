import { ChevronDown } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const RoundSelector = ({
  selectedRounds,
  setSelectedRounds,
  totalCount,
}: {
  selectedRounds: string[]
  setSelectedRounds: Dispatch<SetStateAction<string[]>>
  totalCount: number
}) => {
  const availableRounds = ["4", "5", "6"]

  const toggleRound = (round: string) => {
    setSelectedRounds((prev: string[]) =>
      prev.includes(round)
        ? prev.filter((r) => r !== round)
        : [...prev, round].sort((a, b) => parseInt(a) - parseInt(b)),
    )
  }

  const getRoundsText = () => {
    if (selectedRounds.length === 0) return "No rounds"
    if (selectedRounds.length === 1) return `Round ${selectedRounds[0]}`
    if (selectedRounds.length === availableRounds.length) return "All rounds"

    const formatRounds = (rounds: string[]) => rounds.map((r) => `Round ${r}`)

    if (selectedRounds.length === 2) {
      return formatRounds(selectedRounds).join(" and ")
    }

    const formattedRounds = formatRounds(selectedRounds)
    const lastRound = formattedRounds.pop()
    return `${formattedRounds.join(", ")}, and ${lastRound}`
  }

  return (
    <h1 className="text-xl font-semibold mt-10">
      <span className="text-muted-foreground">
        {totalCount} {totalCount === 1 ? "project" : "projects"} rewarded in{" "}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1 font-semibold">
          {getRoundsText()} <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableRounds.map((round) => (
            <DropdownMenuCheckboxItem
              key={round}
              checked={selectedRounds.includes(round)}
              onCheckedChange={() => toggleRound(round)}
            >
              Round {round}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </h1>
  )
}

export default RoundSelector
