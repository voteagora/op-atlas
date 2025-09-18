"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { Check, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { sendKYCVerificationEmail, resendKYCVerificationEmail } from "@/lib/actions/emails"
import { usePendingKYCVerification } from "@/hooks/usePendingKYCVerification"
import { cn } from "@/lib/utils"

enum FindKYCState {
  INITIAL = "initial",
  SENDING = "sending",
  SENT = "sent",
  ERROR = "error",
}

export default function FindMyKYC() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [state, setState] = useState<FindKYCState>(FindKYCState.INITIAL)
  const [errorMessage, setErrorMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const { hasPendingVerification, pendingEmail, isLoading } = usePendingKYCVerification()

  // Check if we should show the sent state based on pending verification
  useEffect(() => {
    if (!isLoading && hasPendingVerification && pendingEmail) {
      setState(FindKYCState.SENT)
      setEmail(pendingEmail)
    }
  }, [isLoading, hasPendingVerification, pendingEmail])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setErrorMessage("Please enter an email address")
      setState(FindKYCState.ERROR)
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")
      setState(FindKYCState.ERROR)
      return
    }

    setState(FindKYCState.SENDING)
    setErrorMessage("")

    startTransition(async () => {
      try {
        const result = await sendKYCVerificationEmail(email.trim().toLowerCase())

        if (result.success) {
          setState(FindKYCState.SENT)
          toast.success(result.message || "Verification email sent!")
        } else {
          setState(FindKYCState.ERROR)
          toast.error(result.error || "Failed to send verification email")
        }
      } catch (error) {
        console.error("Error sending verification email:", error)
        setState(FindKYCState.ERROR)
        toast.error("Failed to send verification email. Please try again.")
      }
    })
  }

  const handleResend = async () => {
    setIsResending(true)

    startTransition(async () => {
      try {
        const result = await resendKYCVerificationEmail()

        if (result.success) {
          toast.success("Verification email sent again!")
        } else {
          toast.error(result.error || "Failed to resend verification email")
        }
      } catch (error) {
        console.error("Error resending verification email:", error)
        toast.error("Failed to resend verification email. Please try again.")
      } finally {
        setIsResending(false)
      }
    })
  }

  const handleSendToDifferentEmail = () => {
    setState(FindKYCState.INITIAL)
    setEmail("")
    setErrorMessage("")
  }

  const isFormValid = email.trim() && validateEmail(email)

  return (
    <div className="flex flex-col gap-6 border p-6 border-[#E0E2EB] rounded-[12px]">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground">Find My KYC</h3>
        <p className="text-secondary-foreground">
          Already completed KYC verification with a different email? Enter it below to link your existing verification to this account.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      ) : state === FindKYCState.SENT ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Verification Email Sent</p>
              <p className="text-sm text-green-700">
                We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to link your KYC verification.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              size="sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Email"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendToDifferentEmail}
              size="sm"
            >
              Send to Different Email
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="kyc-email" className="block text-sm font-medium mb-2">
              Email Address<span className="text-destructive">*</span>
            </label>
            <Input
              id="kyc-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === FindKYCState.ERROR) {
                  setState(FindKYCState.INITIAL)
                  setErrorMessage("")
                }
              }}
              placeholder="Enter the email used for your KYC verification"
              disabled={state === FindKYCState.SENDING}
              className={cn(
                state === FindKYCState.ERROR && "border-destructive"
              )}
            />
            {state === FindKYCState.ERROR && errorMessage && (
              <p className="text-sm text-destructive mt-1">{errorMessage}</p>
            )}
          </div>

          <div className="flex justify-start">
            <Button
              type="submit"
              variant="destructive"
              disabled={!isFormValid || state === FindKYCState.SENDING}
              size="lg"
            >
              {state === FindKYCState.SENDING ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Find My KYC"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}