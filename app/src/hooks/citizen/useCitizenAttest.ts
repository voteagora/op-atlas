"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { attestCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { buildFrontendTraceContext } from "@/lib/mirador/clientTraceContext"
import {
  addMiradorEvent,
  closeMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace"

export const useCitizenAttest = (userId: string, redirectUrl?: string) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const { invalidate } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: userId },
    enabled: false,
  })

  const call = () => {
    startTransition(async () => {
      const trace = startMiradorTrace({
        name: "S8CitizenRegistration",
        flow: MIRADOR_FLOW.citizenS8Registration,
        context: {
          source: "frontend",
          userId,
          sessionId: userId,
        },
        tags: ["citizen", "registration", "s8", "frontend"],
      })

      addMiradorEvent(trace, "s8_registration_submit_started", { userId })

      try {
        const loadingToast = toast.loading("Issuing citizen badge")
        const traceContext = await buildFrontendTraceContext(trace, {
          flow: MIRADOR_FLOW.citizenS8Registration,
          step: "s8_registration_submit",
          userId,
          sessionId: userId,
        })

        const result = await attestCitizen(traceContext)
        if (result?.error) {
          throw new Error(result.error)
        }

        invalidate().then(() => {
          setIsSuccess(true)
          toast.dismiss(loadingToast)
          toast.success("You are ready to vote!")
          addMiradorEvent(trace, "s8_registration_submit_succeeded", { userId })
          void closeMiradorTrace(trace, "S8 registration succeeded")
          setTimeout(() => {
            if (redirectUrl) {
              router.push(redirectUrl)
            } else {
              router.refresh()
            }
          }, 1000)
        })
      } catch (error) {
        setIsSuccess(false)
        addMiradorEvent(trace, "s8_registration_submit_failed", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
        void closeMiradorTrace(trace, "S8 registration failed")
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
