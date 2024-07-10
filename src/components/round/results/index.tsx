import React from "react"

import ProjectsList from "./ProjectsList"
import ResultFilters from "./ResultFilters"
import ResultsHeader from "./ResultsHeader"

export function Results() {
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
        <ResultFilters />
        <ProjectsList />
      </div>
    </main>
  )
}
