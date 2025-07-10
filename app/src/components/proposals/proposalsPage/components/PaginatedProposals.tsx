"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

import Proposals from "./Proposals"
import { StandardProposalProps } from "./Proposals"
import { fetchMoreProposals } from "../actions"

interface PaginationMetadata {
  has_next: boolean
  total_returned: number
  next_offset: number
}

interface PaginatedProposalsProps {
  initialProposals: StandardProposalProps[]
  initialPagination: PaginationMetadata
  userId?: string
}

const PaginatedProposals = ({
  initialProposals,
  initialPagination,
  userId,
}: PaginatedProposalsProps) => {
  const [proposals, setProposals] =
    useState<StandardProposalProps[]>(initialProposals)
  const [pagination, setPagination] =
    useState<PaginationMetadata>(initialPagination)
  const [currentOffset, setCurrentOffset] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreProposals = async () => {
    if (!pagination.has_next) return

    setIsLoading(true)
    try {
      // Calculate the next page based on next_offset
      const nextOffset = pagination.next_offset

      const result = await fetchMoreProposals(userId, nextOffset)

      setCurrentOffset(nextOffset)
      // Add new proposals to the existing ones
      setProposals((prev) => [...prev, ...result.standardProposals.proposals])
      // Update pagination information
      setPagination((prev) => ({
        ...prev,
        ...result.standardProposals.pagination,
      }))
    } catch (error) {
      console.error("Error loading more proposals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Proposals proposals={proposals} />

      {pagination.has_next && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={loadMoreProposals}
            disabled={isLoading}
            variant="outline"
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PaginatedProposals
