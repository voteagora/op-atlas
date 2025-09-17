"use client"

import { KYCUser } from "@prisma/client"
import { CheckCircle, XCircle, Check, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import { toast } from "sonner"

import { StatusIcon } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { ExtendedPersonaStatus, EmailState } from "@/components/projects/types"
import { sendPersonalKYCReminderEmail } from "@/lib/actions/emails"
import { deletePersonalKYC } from "@/lib/actions/userKyc"
import { cn } from "@/lib/utils"

interface PersonalKYCStatusProps {
  kycUser: KYCUser
}

// Email resend button component
const EmailSendButton = ({
  kycUser,
  emailState,
  onResendEmail,
}: {
  kycUser: KYCUser
  emailState: EmailState
  onResendEmail: (kycUser: KYCUser) => Promise<void>
}) => {
  switch (emailState) {
    case EmailState.NOT_SENT:
      return (
        <div
          role={"button"}
          tabIndex={0}
          title={"Resend email"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onResendEmail(kycUser)
            }
          }}
          onClick={() => onResendEmail(kycUser)}
          className="rounded-md px-2 py-1 hover:bg-button-secondary hover:border hover:border-button-secondary hover:cursor-pointer active:border active:border-b-accent"
        >
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] tracking-[0%]">
            Resend email
          </p>
        </div>
      )
    case EmailState.SENDING:
      return <Loader2 className={cn(`h-4 w-4`, "animate-spin")} />
    case EmailState.SENT:
      return (
        <div className="flex flex-row items-center gap-2" title="Email sent">
          <p className="text-green-900 text-xs font-light">Email sent</p>
          <Check className={cn(`h-4 w-4`, "text-green-900")} />
        </div>
      )
  }
}

const PersonalKYCUserRow = ({
  kycUser,
  emailState,
  onResendEmail
}: {
  kycUser: KYCUser
  emailState: EmailState
  onResendEmail: (kycUser: KYCUser) => Promise<void>
}) => {
  const values = [
    kycUser.firstName + " " + kycUser.lastName,
    kycUser.email,
    kycUser.businessName || "",
  ].filter(Boolean)

  const showResendButton = kycUser.status === "PENDING"

  return (
    <div className="flex flex-row w-full max-w-[664px] h-[40px] pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rotate-0 opacity-100 rounded-[6px] border border-border bg-background">
      <div className="flex flex-row justify-between items-center w-full">
        <div
          className="flex flex-row items-center gap-2 min-w-0 flex-1"
          title={
            kycUser.status
              ? kycUser.status.charAt(0).toUpperCase() +
                kycUser.status.slice(1).toLowerCase()
              : "Pending"
          }
        >
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
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`}
              </Badge>
            )}
          </div>
        </div>
        {showResendButton && (
          <EmailSendButton
            kycUser={kycUser}
            emailState={emailState}
            onResendEmail={onResendEmail}
          />
        )}
      </div>
    </div>
  )
}

const PersonalKYCSubSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-[8px] max-w-[664px]">
      <div className="flex items-center justify-center">
        <p className="font-[Inter] font-medium text-[14px] leading-[20px] text-text-foreground">
          Your Verification Status
        </p>
      </div>
      <div className="flex flex-col gap-[12px]">{children}</div>
    </div>
  )
}

export default function PersonalKYCStatus({ kycUser }: PersonalKYCStatusProps) {
  const [emailState, setEmailState] = useState<EmailState>(EmailState.NOT_SENT)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEmailResend = useCallback(async (kycUser: KYCUser) => {
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
  }, [])

  const handleDeleteKYC = useCallback(async () => {
    try {
      const response = await deletePersonalKYC(kycUser.id)
      if (response.success) {
        toast.success(response.message || "KYC verification deleted successfully")
        // The page should automatically refresh due to revalidatePath
      } else {
        toast.error(response.error || "Failed to delete KYC verification")
      }
    } catch (error) {
      console.error("Failed to delete KYC:", error)
      toast.error("Failed to delete KYC verification")
    }
  }, [kycUser.id])

  const showEditFooter = kycUser.status !== "APPROVED" || (kycUser.expiry && kycUser.expiry < new Date())

  return (
    <>
      <div className="flex flex-col max-w border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        <PersonalKYCSubSection>
          <PersonalKYCUserRow
            kycUser={kycUser}
            emailState={emailState}
            onResendEmail={handleEmailResend}
          />
        </PersonalKYCSubSection>

        {kycUser.status === "PENDING" && (
          <div className="flex flex-row w-full max-w-[664px] justify-center items-center gap-2">
            <p className="font-[Inter] text-[14px] font-[400] leading-[20px] text-center text-secondary-foreground">
              An email from compliance@optimism.io has been sent to you. You must complete KYC/KYB via the link provided. Please take action and allow 48 hours for your status to update.
            </p>
          </div>
        )}

        {showEditFooter && (
          <div className="flex flex-row w-full max-w-[664px] justify-center items-center gap-2">
            <p className="font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
              Is something missing or incorrect?
            </p>
            <span
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setShowDeleteDialog(true)
                }
              }}
              onClick={() => setShowDeleteDialog(true)}
              aria-label="Start KYC process over"
              className="cursor-pointer"
            >
              <p className="underline font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
                Start over
              </p>
            </span>
          </div>
        )}

        {kycUser.status === "APPROVED" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Verification Complete</p>
                <p className="text-sm text-green-700">
                  Your identity has been successfully verified. You're now eligible for grants and rewards.
                </p>
              </div>
            </div>
          </div>
        )}

        {kycUser.status === "REJECTED" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle size={20} className="text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Verification Failed</p>
                <p className="text-sm text-red-700">
                  Your verification could not be completed. Please contact support at{" "}
                  <a href="mailto:compliance@optimism.io" className="underline">
                    compliance@optimism.io
                  </a>{" "}
                  for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteKYC}
        title="Delete KYC Verification"
        description="Are you sure you want to delete your KYC verification? This action cannot be undone and you'll need to start the verification process again."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}