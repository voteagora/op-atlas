"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { attestCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"

export const useCitizenAttest = (userId: string) => {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { invalidate } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: userId },
    enabled: false,
  })

  const call = () => {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("Issuing citizen badge")
        await attestCitizen()
        invalidate().then(() => {
          setIsSuccess(true)
          toast.dismiss(loadingToast)
          toast.success("You are ready to vote!")
          setTimeout(() => {
            window.location.reload()
          }, 3000)
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
