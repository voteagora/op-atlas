"use client"

import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { updateCitizen } from "@/lib/actions/citizens"

export const useCitizenUpdate = (userId: string) => {
  const { invalidate } = useCitizen({ userId, enabled: false })

  const call = (citizen: {
    address?: string
    attestationId?: string
    timeCommitment?: string
  }) => {
    toast.promise(
      updateCitizen(citizen).then(() => invalidate()),
      {
        success: "Citizenship application updated",
        loading: "Updating citizenship application...",
        error: "Failed to update citizenship application",
      },
    )
  }

  return {
    updateCitizen: call,
  }
}
