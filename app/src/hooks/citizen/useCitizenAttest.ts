"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { attestCitizen } from "@/lib/actions/citizens"

export const useCitizenAttest = (userId: string) => {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { invalidate } = useCitizen({ userId, enabled: false })

  const call = () => {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("Issuing citizen badge")
        await attestCitizen()
        invalidate().then(() => {
          setIsSuccess(true)
          toast.dismiss(loadingToast)
          toast.success("You are ready to vote!")
          window.location.reload()
        })
      } catch (error) {
        setIsSuccess(false)
        toast.error("Failed to issue citizen badge")
      }
    })
  }

  return {
    attestCitizen: call,
    isLoading: isPending,
    isSuccess,
  }
}
