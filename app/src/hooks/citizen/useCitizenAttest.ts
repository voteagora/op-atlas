"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { attestCitizen } from "@/lib/actions/citizens"

export const useCitizenAttest = (userId: string) => {
  const [isPending, startTransition] = useTransition()
  const { invalidate } = useCitizen({ userId, enabled: false })

  const call = () => {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("Issuing citizen badge")
        await attestCitizen()
        await invalidate()
        toast.dismiss(loadingToast)
        toast.success("You are ready to vote!")
      } catch (error) {
        toast.error("Failed to issue citizen badge")
      }
    })
  }

  return {
    attestCitizen: call,
    isLoading: isPending,
  }
}
