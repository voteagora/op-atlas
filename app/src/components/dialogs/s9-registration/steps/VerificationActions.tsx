"use client"

import { ReactNode } from "react"

import { Loader2, UserCheck, CheckCircle2 } from "lucide-react"

import { World } from "@/components/icons/socials"

import { Button } from "@/components/ui/button"
import { Button as CommonButton } from "@/components/common/Button"
import { WorldConnection } from "@/components/profile/WorldIdConnection"

type VerificationActionsProps = {
  userId: string
  onVerifyIdentity: () => void
  onRegister: () => void
  onCancel: () => void
  isRegistering: boolean
  verificationStatus: { kyc: boolean; world: boolean }
  onWorldIdConnected: () => void
}

export function VerificationActions({
  userId,
  onVerifyIdentity,
  onRegister,
  onCancel,
  isRegistering,
  verificationStatus,
  onWorldIdConnected,
}: VerificationActionsProps) {
  const canUseWorldId = Boolean(userId)
  const hasVerified = verificationStatus.kyc || verificationStatus.world

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <VerificationOptionRow
          icon={<UserCheck className="h-4 w-4 text-foreground" />}
          label="Verify your identity"
          verified={verificationStatus.kyc}
          action={
            <CommonButton variant="secondary" onClick={onVerifyIdentity} className="h-8">
              Get verified
            </CommonButton>
          }
        />
        <VerificationOptionRow
          icon={<World className="h-4 w-4 text-foreground" />}
          label="Connect your WorldID"
          verified={verificationStatus.world}
          action={
            canUseWorldId ? (
              <WorldConnection
                userId={userId}
                variant="button"
                className="h-8"
                onConnected={onWorldIdConnected}
              >
                Connect
              </WorldConnection>
            ) : (
              <CommonButton className="h-8" disabled variant="secondary">
                Connect
              </CommonButton>
            )
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="destructive"
          className="w-full"
          disabled={!hasVerified || isRegistering}
          onClick={onRegister}
        >
          {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
        <Button variant="outline" className="w-full bg-white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

type VerificationOptionRowProps = {
  icon: ReactNode
  label: string
  action: ReactNode
  verified?: boolean
}

function VerificationOptionRow({ icon, label, action, verified = false }: VerificationOptionRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary h-[44px]">
      <div className="flex items-center gap-2 py-3 pl-3">
        <div className="flex items-center justify-center">{icon}</div>
        <span className="text-sm text-foreground">{label}</span>
        {verified && <CheckCircle2 className="h-4 w-4 text-success-strong" />}
      </div>
      <div className="pr-1.5 py-1.5">{action}</div>
    </div>
  )
}
