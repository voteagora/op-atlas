"use client"

import React from "react"

const ResultsHeader = () => {
  return (
    <div>
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
        <div className="flex flex-col w-full mb-7 sm:mb-0 mt-8 sm:mt-0">
          <h1 className="text-4xl font-semibold text-text-default">
            Recipients
          </h1>
          <p className="mt-2 text-sm font-normal text-text-secondary">
            Explore the projects that have been rewarded
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResultsHeader
