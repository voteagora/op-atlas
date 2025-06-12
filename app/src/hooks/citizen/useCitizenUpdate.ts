"use client"

import { useTransition } from "react"
import { useState } from "react"
import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { updateCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"

export const useCitizenUpdate = (userId: string) => {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { invalidate } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: userId },
    enabled: false,
  })

  const call = (citizen: {
    type: string
    address: string
    attestationId?: string
    timeCommitment?: string
    projectId?: string
    organizationId?: string
  }) => {
    setIsSuccess(false)
    startTransition(async () => {
      try {
        const loadingToast = toast.loading(
          "Updating citizenship application...",
        )
        await updateCitizen(citizen)
        await invalidate()
        toast.dismiss(loadingToast)
        toast.success("Citizenship application updated")
        setIsSuccess(true)
      } catch (error) {
        toast.error("Failed to update citizenship application")
        setIsSuccess(false)
      }
    })
  }

  return {
    updateCitizen: call,
    isLoading: isPending,
    isSuccess,
  }
}
