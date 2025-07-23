"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { fetchMoreProposals } from "@/lib/actions/proposals"
import Proposals from "./Proposals"
import { StandardProposalProps } from "./Proposals"

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

  // Reference to facilitate infinite scroll
  const observerRef = useRef<HTMLDivElement>(null)

  const loadMoreProposals = useCallback(async () => {
    if (!pagination.has_next || isLoading) return

    setIsLoading(true)
    try {
      // Calculate the next page based on next_offset
      const nextOffset = pagination.next_offset

      const result = await fetchMoreProposals(userId, currentOffset)

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
  }, [
    pagination.has_next,
    pagination.next_offset,
    userId,
    isLoading,
    currentOffset,
  ])

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.has_next && !isLoading) {
          loadMoreProposals()
        }
      },
      { threshold: 0.1 },
    )

    const currentObserverRef = observerRef.current

    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [loadMoreProposals, pagination.has_next, isLoading])

  return (
    <div className="flex flex-col gap-6">
      <Proposals proposals={proposals} />

      {pagination.has_next && (
        <div ref={observerRef} className="flex justify-center mt-4 py-4">
          {isLoading && (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading more proposals...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PaginatedProposals
