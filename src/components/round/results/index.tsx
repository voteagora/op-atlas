"use client"
import { useParams } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"

import useDebounce from "@/hooks/useDebounce"
import { findFundingRewards } from "@/lib/actions/projectandrewards"
import { FundingRewardDetails } from "@/lib/types"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
  const params = useParams()
  const roundId = params.roundId.toString()

  const [searchText, setSearchText] = useState("")
  const [sortByAmount, setSortByAmount] = useState<"asc" | "desc">("asc")
  const [projectRound, setProjectRound] = useState("")
  const [projectRewards, setProjectRewards] = useState<FundingRewardDetails[]>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const pageSize = 10
  const debouncedSearchText = useDebounce<string>(searchText, 2000) // 2-second debounce

  useEffect(() => {
    // Fetch initial data
    async function fetchData() {
      try {
        setLoading(true)
        setError("")
        const fetchedRewards = await findFundingRewards({
          roundId,
          search: debouncedSearchText,
          sortByAmount,
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
  }, [debouncedSearchText, roundId, sortByAmount])

  const loadMore = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const nextPage = currentPage + 1
      const fetchedRewards = await findFundingRewards({
        roundId,
        search: debouncedSearchText,
        sortByAmount,
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
      setLoading(false)
    }
  }, [currentPage, roundId, debouncedSearchText, sortByAmount, pageSize])

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
          sortByAmount={sortByAmount}
          setSortByAmount={setSortByAmount}
          setProjectRound={setProjectRound}
        />
        <ProjectsList
          handleLoadMore={loadMore}
          totalCount={totalCount}
          projectRewards={projectRewards}
          loading={loading}
          round={roundId}
        />
      </div>
    </main>
  )
}
