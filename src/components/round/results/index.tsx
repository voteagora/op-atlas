"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import { findFundingRewards } from "@/lib/actions/results"
import { FundingRewardDetails } from "@/lib/types"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
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
  const [round, setRound] = useState(4)

  const pageSize = 10
  const [debouncedSearchText] = useDebounceValue(searchText, 300)

  const fetchData = useCallback(
    async (page: number) => {
      try {
        if (page === 1) setLoading(true)
        else setIsFetchingMore(true)

        setError("")
        const fetchedRewards = await findFundingRewards({
          roundId: round.toString(),
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
    [round, debouncedSearchText, sortBy, pageSize],
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
      <div className="mt-20 p-6 sm:mt-36 sm:p-16 bg-background flex flex-col w-full max-w-6xl rounded-3xl z-10">
        <ResultsHeader roundId={round} />
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
          round={round}
          isFetchingMore={isFetchingMore}
        />
      </div>
    </main>
  )
}
