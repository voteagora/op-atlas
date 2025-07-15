"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { applyForRole } from "@/lib/actions/role"

import { useActiveUserApplications } from "./useActiveUserApplications"

export const useApplyForRole = (userId?: string, roleId?: number) => {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const { invalidate: invalidateActiveApplications } =
    useActiveUserApplications({
      userId: userId || "",
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
        const application = await applyForRole(id, applicationParams)
        // Invalidate hasApplied query on success
        if (applicationParams.userId) {
          invalidateActiveApplications()
        }
        toast.dismiss(loadingToast)
        toast.success("Role application submitted successfully")
        setIsSuccess(true)
        router.push(`/governance/roles/${id}/apply/${application.id}`)
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
