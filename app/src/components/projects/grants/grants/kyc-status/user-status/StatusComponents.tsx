import { AlertTriangle, Loader2, X } from "lucide-react"
import Image from "next/image"

import {
  EmailState,
  ExtendedPersonaStatus,
  KYCUserStatusProps,
} from "@/components/projects/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusIconProps {
  status: ExtendedPersonaStatus
  size?: number
}

const StatusIcon = ({ status, size = 5 }: StatusIconProps) => {
  const sizeInPx = size * 4 // Convert size units to pixels (5 -> 20px)

  switch (status) {
    case "PENDING":
      return <Loader2 className={cn(`h-${size} w-${size}`, "animate-spin")} />
    case "APPROVED":
      return (
        <Image
          src="/assets/icons/circle-check-green.svg"
          height={16.67}
          width={16.67}
          alt="Verified"
        />
      )
    case "REJECTED":
      return <X className={cn(`h-${size} w-${size}`, "text-red-500")} />
    case "project_issue":
      return (
        <AlertTriangle
          className={cn(
            `h-${size} w-${size}`,
            "text-background fill-text-destructive",
          )}
        />
      )
    default:
      return <Loader2 className={cn(`h-${size} w-${size}`, "animate-spin")} />
  }
}

const StatusRow = ({
  user,
  emailResendBlock,
  handleEmailResend,
  emailState,
}: KYCUserStatusProps) => {
  return (
    <div className="flex flex-row w-[664px] h-[40px] pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rotate-0 opacity-100 rounded-[6px] border border-border bg-background">
      <div className="flex flex-row justify-between items-center w-full">
        <div
          className="flex flex-row items-center gap-2"
          title={
            user.status
              ? user.status.charAt(0).toUpperCase() +
                user.status.slice(1).toLowerCase()
              : "Pending"
          }
        >
          <StatusIcon status={user!.status as ExtendedPersonaStatus} />
          <div className="flex flex-row gap-2">
            <RowText
              values={[
                [user.firstName, user.lastName].filter(Boolean).join(" "),
                user.email,
              ]}
            />
          </div>
          <div className="flex flex-row gap-2">
            {user.status === "APPROVED" && user.expiry && (
              <Badge variant="secondary">
                {`Verified until ${new Date(user.expiry).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}`}
              </Badge>
            )}
          </div>
        </div>
        {!emailResendBlock && (
          <EmailSendButton
            user={user}
            handleEmailResend={handleEmailResend}
            emailState={emailState}
          />
        )}
      </div>
    </div>
  )
}

const EmailSendButton = ({
  user,
  handleEmailResend,
  emailState,
}: {
  user: KYCUserStatusProps["user"]
  handleEmailResend: KYCUserStatusProps["handleEmailResend"]
  emailState: KYCUserStatusProps["emailState"]
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
              handleEmailResend(user)
            }
          }}
          onClick={() => {
            console.debug("[StatusRow][UI] Resend email clicked", { user })
            handleEmailResend(user)
          }}
          className="rounded-md px-2 py-1 hover:bg-button-secondary hover:border hover:border-button-secondary hover:cursor-pointer active:border active:border-b-accent"
        >
          <p className="font-riforma font-normal text-[14px] leading-[20px] tracking-[0%]">
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
          <Image
            src="/assets/icons/circle-check-green.svg"
            height={16.67}
            width={16.67}
            alt="Email sent"
          />
        </div>
      )
  }
}

const RowText = ({ values }: { values: string[] }) => (
  <p className="font-riforma font-normal text-[14px] leading-[20px] text-text-foreground">
    {values.filter(Boolean).join(", ")}
  </p>
)

export { StatusIcon, StatusRow }
