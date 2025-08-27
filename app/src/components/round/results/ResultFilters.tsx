"use client"
import { Check, Search } from "lucide-react"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/common/Button"
import { Button as UIButton } from "@/components/ui/button"
import { Dialog, DialogDrawer, DialogTrigger } from "@/components/ui/dialog"
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

const availableRounds = [
  { id: "4", label: "Round 4: Onchain Builders", year: 2024 },
  { id: "5", label: "Round 5: OP Stack", year: 2024 },
  { id: "6", label: "Round 6: Governance", year: 2024 },
  { id: "7", label: "Retro Funding: Dev Tooling", year: 2025 },
  { id: "8", label: "Retro Funding: Onchain Builders", year: 2025 },
]

interface ResultFiltersProps {
  setSearchText: Dispatch<SetStateAction<string>>
  searchText: string
  sortByAmount: "asc" | "desc"
  setSortByAmount: Dispatch<SetStateAction<"asc" | "desc">>
  selectedRounds: string[]
  setSelectedRounds: (rounds: string[]) => void
  totalCount: number
}
const ResultFilters: React.FC<ResultFiltersProps> = ({
  searchText,
  setSearchText,
  sortByAmount,
  setSortByAmount,
  selectedRounds,
  setSelectedRounds,
  totalCount,
}) => {
  const handleSortOptionChange = (state: string) => {
    setSortByAmount(state as "asc" | "desc")
  }

  const [open, setOpen] = useState(false)
  const [localRounds, setLocalRounds] = useState<string[]>([])
  const [allRounds, setAllRounds] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      setLocalRounds(selectedRounds)
      setAllRounds(selectedRounds.length === 0)
    }
  }, [open, selectedRounds])

  const toggleLocalRound = (round: string) => {
    setLocalRounds((prev) => {
      const next = prev.includes(round)
        ? prev.filter((r) => r !== round)
        : [...prev, round].sort((a, b) => parseInt(a) - parseInt(b))

      if (next.length === availableRounds.length) {
        // Collapse to "All rounds"
        setAllRounds(true)
        return []
      }

      setAllRounds(false)
      return next
    })
  }

  const roundsText = useMemo(() => {
    if (selectedRounds.length === 0) return "All rounds (since 2024)"
    if (selectedRounds.length === availableRounds.length)
      return "All rounds (since 2024)"
    const labels = availableRounds
      .filter((r) => selectedRounds.includes(r.id))
      .map((r) => `${r.label} (${r.year})`)
    if (labels.length === 1) return labels[0]
    if (labels.length === 2) return labels.join(", ")
    return `${labels.length} rounds selected`
  }, [selectedRounds])

  return (
    <div className="flex flex-col gap-3 mt-2 md:mt-6">
      <div className="input-container text-inherit">
        <Search className="mr-1 h-4 w-4" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={`Search ${totalCount} projects`}
          className="flex bg-transparent py-2.5 pl-1.5 text-sm leading-4 outline-none border-none focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex flex-row gap-2 items-stretch md:items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="flex-1 basis-1/2 min-w-0 md:flex-none md:basis-auto md:min-w-0">
              <Button
                variant="secondary"
                className="truncate w-full md:w-fit"
                as="dropdown"
              >
                <span className="truncate">{roundsText}</span>
              </Button>
            </div>
          </DialogTrigger>
          <DialogDrawer dontShowCloseButton>
            <div className="flex flex-col w-full p-4">
              <div className="text-center font-semibold text-lg mb-6">
                Show projects rewarded in...
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="w-full text-left px-3 py-2 rounded-md bg-secondary text-secondary-foreground flex items-center gap-2"
                  onClick={() => {
                    setAllRounds(true)
                    setLocalRounds([])
                  }}
                >
                  <span className={allRounds ? "opacity-100" : "opacity-0"}>
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="truncate text-sm">
                    All rounds (since 2024)
                  </span>
                </button>
                {availableRounds.map((r) => (
                  <button
                    key={r.id}
                    className="w-full text-left px-3 py-2 rounded-md bg-secondary text-secondary-foreground flex items-center gap-2"
                    onClick={() => toggleLocalRound(r.id)}
                  >
                    <span
                      className={
                        localRounds.includes(r.id) ? "opacity-100" : "opacity-0"
                      }
                    >
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="truncate text-sm">
                      {r.label} ({r.year})
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <UIButton
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (allRounds) setSelectedRounds([])
                    else setSelectedRounds(localRounds)
                    setOpen(false)
                  }}
                >
                  Apply
                </UIButton>
                <UIButton
                  variant="secondary"
                  className="w-full bg-white text-secondary-foreground hover:bg-secondary/80 border border-secondary-foreground/50"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </UIButton>
              </div>
            </div>
          </DialogDrawer>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex-1 basis-1/2 min-w-0 md:flex-none md:basis-auto md:min-w-0">
              <Button
                variant="secondary"
                as="dropdown"
                className="truncate w-full md:w-fit"
              >
                <div className="px-2 flex items-center justify-center space-x-1.5 truncate w-full min-w-0">
                  <Image
                    src="/assets/icons/sort-desc.svg"
                    width={16}
                    height={16}
                    alt="Sort Desc"
                    className="shrink-0"
                  />
                  <span className="truncate block">
                    {
                      options.find((option) => option.state === sortByAmount)
                        ?.label
                    }
                  </span>
                </div>
              </Button>
            </div>
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
      </div>
    </div>
  )
}

export default ResultFilters
