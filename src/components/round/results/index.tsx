"use client"

import React, { useCallback, useEffect, useState } from "react"

import useDebounce from "@/hooks/useDebounce"
import { findFundingRewards } from "@/lib/actions/results"
import { FundingRewardDetails } from "@/lib/types"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
  const [searchText, setSearchText] = useState("")
  const [sortByAmount, setSortByAmount] = useState<"asc" | "desc">("desc")
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
  const debouncedSearchText = useDebounce<string>(searchText, 300) // 2-second debounce

  useEffect(() => {
    // Fetch initial data
    async function fetchData() {
      try {
        setLoading(true)
        setError("")
        const fetchedRewards = await findFundingRewards({
          roundId: round.toString(),
          search: debouncedSearchText,
          sortBy: sortByAmount,
          page: 1,
          pageSize,
        })

        setProjectRewards(fetchedRewards.fundingRewards?.rewards ?? [])
        setTotalCount(fetchedRewards.fundingRewards?.totalCount || 0)
        setCurrentPage(1)
      } catch (error) {
        setError("Failed to fetch projectRewards")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [debouncedSearchText, round, sortByAmount])

  const loadMore = useCallback(async () => {
    try {
      setIsFetchingMore(true)
      setError("")
      const nextPage = currentPage + 1
      const fetchedRewards = await findFundingRewards({
        roundId: round.toString(),
        search: debouncedSearchText,
        sortBy: sortByAmount,
        page: nextPage,
        pageSize,
      })

      setProjectRewards((prevRewards) => [
        ...prevRewards,
        ...(fetchedRewards.fundingRewards?.rewards ?? []),
      ])
      setCurrentPage(nextPage)
    } catch (error) {
      setError("Failed to fetch projectRewards")
    } finally {
      setIsFetchingMore(false)
    }
  }, [currentPage, round, debouncedSearchText, sortByAmount, pageSize])

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
          sortByAmount={sortByAmount}
          setSortByAmount={setSortByAmount}
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
