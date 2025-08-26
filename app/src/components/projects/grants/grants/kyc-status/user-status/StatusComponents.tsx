import { AlertTriangle, Check, Clock, Loader2, X } from "lucide-react"

import {
  ExtendedPersonaStatus,
  KYCUserStatusProps,
  PersonaStatus,
} from "@/components/projects/types"
import { cn } from "@/lib/utils"

interface StatusIconProps {
  status: ExtendedPersonaStatus
  size?: number
}

const StatusIcon = ({ status, size = 5 }: StatusIconProps) => {
  switch (status) {
    case "created":
    case "pending":
    case "needs_review":
      return <Loader2 className={cn(`h-${size} w-${size}`, "animate-spin")} />
    case "completed":
    case "approved":
      return <Check className={cn(`h-${size} w-${size}`, "text-green-500")} />
    case "failed":
    case "declined":
      return <X className={cn(`h-${size} w-${size}`, "text-red-500")} />
    case "expired":
      return <Clock className={cn(`h-${size} w-${size}`, "text-yellow-500")} />
    case "project_issue":
      return (
        <AlertTriangle className={cn(`h-${size} w-${size}`, "text-red-500")} />
      )
    default:
      return <Loader2 className={cn(`h-${size} w-${size}`, "animate-spin")} />
  }
}

const Card = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center rounded-full px-[2px] py-2 bg-backgroundSecondary">
    <p className="font-[Inter] font-medium text-xs leading-[16px] text-center">
      {text}
    </p>
  </div>
)

const StatusRow = ({
  name,
  email,
  organization,
  isUser,
  status = "pending", // Default to pending if no status is provided
  expirationDate,
  handleEmailResend,
  emailResendBlock,
}: KYCUserStatusProps) => {
  return (
    <div className="flex flex-row w-[664px] h-[40px] pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rotate-0 opacity-100 rounded-[6px] border border-border bg-background">
      <div className="flex flex-row justify-between items-center w-full">
        <div
          className="flex flex-row items-center gap-2"
          title={
            // Sentence case the status and replace underscores with spaces
            status.replace(/_/g, " ").charAt(0).toUpperCase() +
            status.replace(/_/g, " ").slice(1)
          }
        >
          <StatusIcon status={status} />
          <div className="flex flex-row gap-2">
            <RowText values={[name, email, organization]} />
          </div>
          <div className="flex flex-row gap-2">
            {isUser && <Card text="You" />}
            {expirationDate && (
              <Card
                // Convert expiration date to a human-readable format
                text={`Valid until ${expirationDate.toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}`}
              />
            )}
          </div>
        </div>
        {!expirationDate && !emailResendBlock && handleEmailResend && (
          <button onClick={() => handleEmailResend(email)}>Resend Email</button>
        )}
      </div>
    </div>
  )
}

const RowText = ({ values }: { values: string[] }) => (
  <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-text-foreground">
    {values.join(", ")}
  </p>
)

export { StatusIcon, StatusRow, Card }
