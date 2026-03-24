"use client"

import { Loader2 } from "lucide-react"

export function CheckingStep() {
  return (
    <div className="flex flex-col items-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h3 className="mt-4 text-center text-xl font-semibold text-foreground">
        Checking your eligibility
      </h3>
      <p className="mt-2 text-center text-sm text-secondary-foreground">
        This could take a minute
      </p>
    </div>
  )
}
