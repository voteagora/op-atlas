"use client"

import { useTransition } from "react"
import { useState } from "react"
import { toast } from "sonner"

import { applyForRole } from "@/lib/actions/role"

import { useHasApplied } from "./useHasApplied"

export const useApplyForRole = (userId?: string, roleId?: number) => {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)

  const { invalidate: invalidateHasApplied } = useHasApplied({
    userId: userId || "",
    roleId: roleId || 0,
    enabled: false,
  })

  const call = (
    id: number,
    applicationParams: {
      userId?: string
      organizationId?: string
      application: string
    },
  ) => {
    setIsSuccess(false)
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("Applying for role...")
        await applyForRole(id, applicationParams)
        // Invalidate hasApplied query on success
        if (applicationParams.userId) {
          invalidateHasApplied()
        }
        toast.dismiss(loadingToast)
        toast.success("Role application submitted successfully")
        setIsSuccess(true)
      } catch (error) {
        toast.error("Failed to apply for role")
        setIsSuccess(false)
      }
    })
  }

  return {
    applyForRole: call,
    isLoading: isPending,
    isSuccess,
  }
}
