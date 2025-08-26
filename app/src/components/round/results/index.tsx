"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import useDebounce from "@/hooks/useDebounce"
import { findFundingRewards } from "@/lib/actions/results"
import { FundingRewardDetails } from "@/lib/types"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
  const searchParams = useSearchParams()
  const router = useRouter()

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
  const pageSize = 10
  const debouncedSearchText = useDebounce<string>(searchText, 300)

  // Parse selected rounds from URL
  const selectedRounds = useMemo(() => {
    const roundsParam = searchParams.get("rounds")
    return roundsParam ? roundsParam.split(",") : []
  }, [searchParams])

  const updateSelectedRounds = (rounds: string[]) => {
    const params = new URLSearchParams(searchParams.toString())

    if (rounds.length > 0) {
      params.set("rounds", rounds.join(","))
    } else {
      params.delete("rounds")
    }

    router.replace(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError("")
        {
          const fetchedRewards = await findFundingRewards({
            roundIds: selectedRounds,
            search: debouncedSearchText,
            sortBy: sortByAmount,
            page: 1,
            pageSize,
          })
          setProjectRewards(fetchedRewards.fundingRewards?.rewards ?? [])
          setTotalCount(fetchedRewards.fundingRewards?.totalCount || 0)
        }
      } catch (error) {
        setError("Failed to fetch projectRewards")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [debouncedSearchText, selectedRounds, sortByAmount])

  const loadMore = useCallback(async () => {
    try {
      setIsFetchingMore(true)
      setError("")
      const nextPage = currentPage + 1
      {
        const fetchedRewards = await findFundingRewards({
          roundIds: selectedRounds,
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
      }
    } catch (error) {
      setError("Failed to fetch projectRewards")
    } finally {
      setIsFetchingMore(false)
    }
  }, [currentPage, selectedRounds, debouncedSearchText, sortByAmount])

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-4 p-6 sm:mt-4 sm:p-16 bg-background flex flex-col w-full max-w-6xl rounded-3xl z-10">
        <ResultsHeader />
        <ResultFilters
          setSearchText={setSearchText}
          searchText={searchText}
          sortByAmount={sortByAmount}
          setSortByAmount={setSortByAmount}
          selectedRounds={selectedRounds}
          setSelectedRounds={updateSelectedRounds}
          totalCount={totalCount}
        />
        <ProjectsList
          handleLoadMore={loadMore}
          totalCount={totalCount}
          projectRewards={projectRewards}
          loading={loading}
          isFetchingMore={isFetchingMore}
        />
      </div>
    </main>
  )
}
