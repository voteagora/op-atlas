"use client"
import { useParams } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import { findFundingRewards } from "@/lib/actions/results"
import { FundingRewardDetails } from "@/lib/types"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
  const params = useParams()
  const roundId = params.roundId.toString()

  const [searchText, setSearchText] = useState("")
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc")
  const [projectRewards, setProjectRewards] = useState<FundingRewardDetails[]>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const pageSize = 10
  const [debouncedSearchText] = useDebounceValue(searchText, 300)

  const fetchData = useCallback(
    async (page: number) => {
      try {
        if (page === 1) setLoading(true)
        else setIsFetchingMore(true)

        setError("")
        const fetchedRewards = await findFundingRewards({
          roundId,
          search: debouncedSearchText,
          sortBy,
          page,
          pageSize,
        })

        if (page === 1) {
          setProjectRewards(fetchedRewards.fundingRewards?.rewards ?? [])
        } else {
          setProjectRewards((prevRewards) => [
            ...prevRewards,
            ...(fetchedRewards.fundingRewards?.rewards ?? []),
          ])
        }

        setTotalCount(fetchedRewards.fundingRewards?.totalCount || 0)
        setCurrentPage(page)
      } catch (error) {
        setError("Failed to fetch project rewards")
      } finally {
        setLoading(false)
        setIsFetchingMore(false)
      }
    },
    [roundId, debouncedSearchText, sortBy, pageSize],
  )

  useEffect(() => {
    fetchData(1)
  }, [fetchData])

  const loadMore = useCallback(() => {
    fetchData(currentPage + 1)
  }, [fetchData, currentPage])

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* Background image */}
      <div
        className="absolute h-[500px] w-full"
        style={{
          backgroundImage: 'url("/assets/images/gradient-background.svg")',
          backgroundSize: "cover",
        }}
      />

      {/* Main content */}
      <div className="mt-36 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
        <ResultsHeader />
        <ResultFilters
          setSearchText={setSearchText}
          searchText={searchText}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <ProjectsList
          handleLoadMore={loadMore}
          totalCount={totalCount}
          projectRewards={projectRewards}
          loading={loading}
          round={roundId}
          isFetchingMore={isFetchingMore}
        />
      </div>
    </main>
  )
}
