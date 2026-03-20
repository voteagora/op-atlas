"use client"

import { usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"

import { useUser } from "../db/useUser"

export const usePrivyUnlinkWallet = (userId: string) => {
  const { unlinkWallet } = usePrivy()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })

  const handleUnlinkWallet = (address: string) => {
    toast.promise(unlinkWallet(address), {
      loading: "Removing wallet address...",
      success: (updatedPrivyUser) => {
        syncPrivyUser(updatedPrivyUser).then(() => {
          invalidateUser()
        })
        return "Wallet address removed successfully"
      },
      error: (error) => {
        return error.message
      },
    })
  }

  return {
    unlinkWallet: handleUnlinkWallet,
  }
}
