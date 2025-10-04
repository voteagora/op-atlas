"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAppDialogs } from "@/providers/DialogProvider"
import { DialogProps } from "@/components/dialogs/types"
import CodeInput from "@/components/common/CodeInput"
import { sendFindMyKYCVerificationCode, validateFindMyKYCCode } from "@/lib/actions/emails"
import { cn } from "@/lib/utils"

enum FindMyKYCState {
  INITIAL = "initial",
  CODE_INPUT = "code_input",
  VERIFYING = "verifying",
  SUCCESS = "success",
  NOT_FOUND = "not_found",
}

interface FindMyKYCData {
  email?: string
}

export default function FindMyKYCDialog({ open, onOpenChange }: DialogProps<object>) {
  const { data } = useAppDialogs()
  const findMyKYCData = data as FindMyKYCData

  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<FindMyKYCState>(FindMyKYCState.INITIAL)
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentUserEmail = findMyKYCData?.email || "[name@email.com]"

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setError("Please enter an email address")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError("")

    startTransition(async () => {
      try {
        const result = await sendFindMyKYCVerificationCode(email)

        if (result.success) {
          setIsTransitioning(true)
          setTimeout(() => {
            setState(FindMyKYCState.CODE_INPUT)
            setIsTransitioning(false)
          }, 150)
        } else {
          setError(result.error || "Failed to send verification code.")
        }
      } catch (error) {
        console.error("Error sending verification code:", error)
        setError("Failed to send verification code. Please try again.")
      }
    })
  }

  const handleCodeSubmit = () => {
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setError("")
    setIsTransitioning(true)
    setTimeout(() => {
      setState(FindMyKYCState.VERIFYING)
      setIsTransitioning(false)
    }, 150)

    startTransition(async () => {
      try {
        const result = await validateFindMyKYCCode(email, verificationCode)

        if (result.success) {
          setIsTransitioning(true)
          setTimeout(() => {
            setState(FindMyKYCState.SUCCESS)
            setIsTransitioning(false)
          }, 150)
        } else {
          if (result.error === "KYC verification is no longer available for linking." ||
              result.error === "No KYC verification found for this email address.") {
            setIsTransitioning(true)
            setTimeout(() => {
              setState(FindMyKYCState.NOT_FOUND)
              setIsTransitioning(false)
            }, 150)
          } else {
            setError(result.error || "Failed to validate code.")
            setIsTransitioning(true)
            setTimeout(() => {
              setState(FindMyKYCState.CODE_INPUT)
              setIsTransitioning(false)
            }, 150)
          }
        }
      } catch (error) {
        console.error("Error validating code:", error)
        setError("Failed to validate code. Please try again.")
        setIsTransitioning(true)
        setTimeout(() => {
          setState(FindMyKYCState.CODE_INPUT)
          setIsTransitioning(false)
        }, 150)
      }
    })
  }

  const resetState = () => {
    setState(FindMyKYCState.INITIAL)
    setEmail("")
    setVerificationCode("")
    setError("")
    setIsTransitioning(false)
  }

  const handleDialogOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    if (!isOpen) {
      resetTimeoutRef.current = setTimeout(() => {
        resetState()
        resetTimeoutRef.current = null
      }, 300)
    }
  }

  const handleDismiss = () => {
    handleDialogOpenChange(false)
  }

  useEffect(() => () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
    }
  }, [])


  const renderContent = () => {
    switch (state) {
      case FindMyKYCState.INITIAL:
        return (
          <div className="flex flex-col text-center">
            <div className="font-semibold text-xl">
              Within the last year, did you complete KYC using a different email from {currentUserEmail}?
            </div>

            <div className="text-base text-secondary-foreground mt-2">
              We don&apos;t have a record of KYC for your account&apos;s email address. If you completed KYC under a different email, submit that address below.
            </div>

            <div className="mt-6 space-y-2">
              <div className="text-left">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="Email"
                  disabled={isPending}
                  className={cn(error && "border-destructive")}
                />
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>

              <Button
                onClick={handleEmailSubmit}
                size={"lg"}
                disabled={isPending || !validateEmail(email.trim())}
                className="w-full bg-red-500 hover:bg-red-600 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        )

      case FindMyKYCState.CODE_INPUT:
        return (
          <div className="flex flex-col text-center">
            <div className="font-semibold text-xl">Confirm your email</div>

            <div className="text-base text-secondary-foreground mt-2">
              Check {email} for an email from compliance@optimism.io and enter your code below.
            </div>

            <div className="mt-6 space-y-2">
              <CodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                length={6}
                disabled={isPending}
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleCodeSubmit}
                size={"lg"}
                disabled={isPending || verificationCode.length !== 6}
                className="w-full bg-red-500 hover:bg-red-600 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        )

      case FindMyKYCState.VERIFYING:
        return (
          <div className="flex flex-col text-center py-8">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>

            <div className="mt-6">
              <div className="font-semibold text-xl">
                We&apos;re checking our KYC records for {email}
              </div>
              <div className="text-base text-secondary-foreground mt-2">
                This could take a few minutes.
              </div>
            </div>
          </div>
        )

      case FindMyKYCState.SUCCESS:
        return (
          <div className="flex flex-col text-center py-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="mt-6">
              <div className="font-semibold text-xl">
                Success, we found a KYC record for {email}
              </div>

              <Button
                onClick={handleDismiss}
                size={"lg"}
                className="w-full bg-red-500 hover:bg-red-600 mt-6 text-base"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )

      case FindMyKYCState.NOT_FOUND:
        return (
          <div className="flex flex-col text-center py-4">
            <div className="font-semibold text-xl">
              Sorry, but no record of KYC exists for {email}
            </div>

            <Button
              onClick={handleDismiss}
              size={"lg"}
              className="w-full bg-red-500 hover:bg-red-600 mt-6 text-base"
            >
              Dismiss
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <div className={cn(
          "transition-opacity duration-150 ease-in-out",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
