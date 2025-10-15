"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2, TriangleAlert, Check } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/utils"

type ErrorType = "invalid" | "expired" | "generic" | null

export default function KYCVerifyPage() {
  const params = useParams()
  const [errorType, setErrorType] = useState<ErrorType>(null)
  const token = params.token as string
  const hasCalledApi = useRef(false)

  const handleCopyEmail = async () => {
    try {
      await copyToClipboard("compliance@optimism.io")
      toast("Address copied", {
        icon: <Check className="h-5 w-5 text-green-500" />,
        className: "gap-3",
      })
    } catch (error) {
      toast.error("Failed to copy email")
    }
  }

  useEffect(() => {
    // Prevent double-calls from React Strict Mode
    if (hasCalledApi.current) return
    hasCalledApi.current = true

    async function processKYCVerification() {
      try {
        const response = await fetch(`/api/kyc/verify/${token}`, {
          method: "POST",
        })

        const data = await response.json()

        if (!response.ok) {
          // Determine error type based on status code
          if (response.status === 400) {
            setErrorType("invalid") // Invalid JWT
          } else if (response.status === 410) {
            setErrorType("expired") // Expired link
          } else {
            setErrorType("generic") // Other errors
          }
          return
        }

        if (data.redirectUrl) {
          // Redirect to Persona with the one-time link
          window.location.href = data.redirectUrl
        } else {
          setErrorType("generic")
        }
      } catch (err) {
        console.error("Error processing KYC verification:", err)
        setErrorType("generic")
      }
    }

    if (token) {
      processKYCVerification()
    }
  }, [token])

  return (
    <div className="relative z-50 flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex max-w-[410px] flex-col items-center">
        {errorType ? (
          <>
            {/* Error State */}
            <TriangleAlert className="h-16 w-16 text-foreground" />
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-semibold">
                {errorType === "invalid"
                  ? "This link is invalid"
                  : errorType === "expired"
                    ? "Your verification link is no longer valid"
                    : "Something went wrong"}
              </h2>
              <p className="text-base text-muted-foreground">
                {errorType === "invalid" || errorType === "expired" ? (
                  <>
                    You can request a new link from your project&apos;s admin, or
                    contact support at{" "}
                    <button
                      onClick={handleCopyEmail}
                      className="cursor-pointer underline hover:text-foreground"
                    >
                      compliance@optimism.io
                    </button>
                    .
                  </>
                ) : (
                  <>
                    Please try again later. If the issue persists, you can
                    contact support at{" "}
                    <button
                      onClick={handleCopyEmail}
                      className="cursor-pointer underline hover:text-foreground"
                    >
                      compliance@optimism.io
                    </button>
                    .
                  </>
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Loading State */}
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-semibold">
                Checking your verification
              </h2>
              <p className="text-base text-muted-foreground">
                You&apos;ll be redirected shortly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
