"use client"

import { IDKitWidget } from "@worldcoin/idkit"
import { toast } from "sonner"

import { useUserWorldId } from "@/hooks/db/useUserWorldId"

export function WorldConnection({
  userId,
  children,
}: {
  userId: string
  children: React.ReactNode
}) {
  const { invalidate } = useUserWorldId({ id: userId, enabled: false })

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

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID}
      action={process.env.NEXT_PUBLIC_WORLD_APP_ACTION}
      handleVerify={verifyProof}
      onSuccess={() => invalidate()}
    >
      {({ open }: { open: () => void }) => (
        <button onClick={open}>{children}</button>
      )}
    </IDKitWidget>
  )
}
