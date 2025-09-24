"use client"

import { KYCUser } from "@prisma/client"
import { Check, Loader2, TriangleAlert } from "lucide-react"
import { useState, useCallback } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { StatusIcon } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { Badge } from "@/components/ui/badge"
import { ExtendedPersonaStatus, EmailState } from "@/components/projects/types"
import { sendPersonalKYCReminderEmail } from "@/lib/actions/emails"

interface PersonalKYCStatusProps {
  kycUser: KYCUser
}


const PersonalKYCUserRow = ({ kycUser }: { kycUser: KYCUser }) => {
  const values = [
    kycUser.firstName && kycUser.lastName ? `${kycUser.firstName} ${kycUser.lastName}` : null,
    kycUser.email,
    kycUser.businessName || null,
  ].filter(Boolean)

  return (
    <div className="flex flex-row w-full max-w-[664px] h-[40px] pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rounded-[6px] border border-border bg-background">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
          <StatusIcon status={kycUser.status as ExtendedPersonaStatus} />
          <div className="flex flex-row gap-2 min-w-0 flex-1">
            <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-text-foreground truncate">
              {values.join(", ")}
            </p>
          </div>
          <div className="flex flex-row gap-2 flex-shrink-0">
            {kycUser.status === "APPROVED" && kycUser.expiry && (
              <Badge variant="secondary">
                {`Verified until ${new Date(
                  kycUser.expiry,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PersonalKYCStatus({ kycUser }: PersonalKYCStatusProps) {
  const [emailState, setEmailState] = useState<EmailState>(EmailState.NOT_SENT)

  const handleEmailResend = useCallback(async () => {
    setEmailState(EmailState.SENDING)
    try {
      const response = await sendPersonalKYCReminderEmail(kycUser.id)
      if (response.success) {
        toast.success("Reminder email sent successfully!")
        setEmailState(EmailState.SENT)
      } else {
        toast.error(response.error || "Failed to send reminder email")
        setEmailState(EmailState.NOT_SENT)
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      toast.error("Failed to send reminder email")
      setEmailState(EmailState.NOT_SENT)
    }
  }, [kycUser.id])

  if (kycUser.status === "PENDING") {
    return (
      <div className="flex flex-col border p-6 gap-4 border-[#E0E2EB] rounded-[12px]">
        <Loader2 className="h-6 w-6 animate-spin" />

        <span className="text-sm text-secondary-foreground">
          A message from compliance@optimism.io has been sent to your email. Please complete KYC via the
          link provided and allow 48 hours for your status to update.
        </span>

        <div className="flex items-start">
          {emailState === EmailState.SENT ? (
            <div className="flex items-center gap-2">
              <span className="text-green-900 text-xs font-light">Email sent</span>
              <Check className="h-4 w-4 text-green-900" />
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={handleEmailResend}
              disabled={emailState === EmailState.SENDING}
            >
              {emailState === EmailState.SENDING ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resending...
                </>
              ) : (
                "Resend email"
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (kycUser.status === "APPROVED") {
    return <PersonalKYCUserRow kycUser={kycUser} />
  }

  if (kycUser.status === "REJECTED") {
    return (
      <div className="flex flex-col border p-6 gap-3 border-[#E0E2EB] rounded-[12px]">
        <TriangleAlert className="h-6 w-6 text-brand-primary" />

        <div className="text-sm">
          <span className="text-brand-primary">
            There is an issue with your verification process. Please reach out to us at{" "}
            <a
              href="mailto:compliance@optimism.io"
              className="text-brand-primary underline hover:no-underline"
            >
              compliance@optimism.io
            </a>
            {" "}for assistance.
          </span>
        </div>
      </div>
    )
  }

  return null
}