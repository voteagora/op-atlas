"use client"

import { IDKitWidget } from "@worldcoin/idkit"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { useUserWorldId } from "@/hooks/db/useUserWorldId"
import { cn } from "@/lib/utils"

export function WorldConnection({
  userId,
  children,
  variant = "default",
  className,
  onConnected,
}: {
  userId: string
  children: React.ReactNode
  variant?: "default" | "button"
  className?: string
  onConnected?: () => void
}) {
  const { data: worldId, invalidate } = useUserWorldId({ id: userId, enabled: true })

  const verifyProof = async (proof: any) => {
    const toastId = toast.loading("Verifying World ID...")

    try {
      const response = await fetch("/api/world/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.dismiss(toastId)
        toast.error("Failed to verify World ID")
        return
      }

      if (data.code === "max_verifications_reached") {
        toast.dismiss(toastId)
        toast.success("You have already verified your World ID")
        return
      }

      toast.dismiss(toastId)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Failed to verify World ID")
    }
  }

  // If user is already verified, show verified state
  if (worldId?.verified) {
    return (
      <div
        className={cn(
          "flex p-3 border items-center gap-1.5 rounded-lg h-10 w-fit",
          className,
        )}
      >
        <CheckboxCircleFIll className="w-4 h-4" fill="#1DBA6A" />
        <p className="text-sm">Verified</p>
      </div>
    )
  }

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID}
      action={process.env.NEXT_PUBLIC_WORLD_APP_ACTION}
      handleVerify={verifyProof}
      onSuccess={async () => {
        await invalidate()
        onConnected?.()
      }}
    >
      {({ open }: { open: () => void }) =>
        variant === "button" ? (
          <Button variant="secondary" onClick={open} className={className}>
            {children}
          </Button>
        ) : (
          <button onClick={open}>{children}</button>
        )
      }
    </IDKitWidget>
  )
}
