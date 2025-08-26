import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useRef } from "react"
import { toast } from "sonner"

import { makeUserAddressPrimaryAction } from "@/app/profile/verified-addresses/actions"
import { syncPrivyUser } from "@/db/privy"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"

export const usePrivyLinkWallet = (userId: string) => {
  const isLinking = useRef(false)
  const isLinkingPrimary = useRef(false)
  const { unlinkWallet } = usePrivy()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const onError = useHandlePrivyErrors()
  const { track } = useAnalytics()

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

  const { linkWallet } = useLinkAccount({
    onSuccess: ({ user: updatedPrivyUser, linkedAccount }) => {
      if (linkedAccount.type === "wallet" && isLinking.current) {
        track("Wallet Linked", {
          userId,
          elementType: "Hook",
          elementName: "useLinkPrivyWallet",
        })
        toast.promise(
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => (isLinking.current = false)),
          {
            loading: "Adding wallet address...",
            success: "Wallet address added successfully",
            error: "Failed to add wallet address",
          },
        )
      }
    },
    onError,
  })

  const { linkWallet: linkWithPrimary } = useLinkAccount({
    onSuccess: ({ user: updatedPrivyUser, linkedAccount }) => {
      if (linkedAccount.type === "wallet" && isLinkingPrimary.current) {
        track("Wallet Linked", {
          userId,
          elementType: "Hook",
          elementName: "useLinkPrivyWallet",
        })
        toast.promise(
          syncPrivyUser(updatedPrivyUser)
            .then(() => makeUserAddressPrimaryAction(linkedAccount.address))
            .then(() => invalidateUser())
            .then(() => (isLinkingPrimary.current = false)),
          {
            loading: "Adding wallet address...",
            success: "Wallet address added successfully",
            error: "Failed to add wallet address",
          },
        )
      }
    },
    onError,
  })

  const linkWalletWithState = (
    { primary }: { primary: boolean } = { primary: false },
  ) => {
    if (primary === true) {
      isLinkingPrimary.current = true
      linkWithPrimary()
    } else {
      isLinking.current = true
      linkWallet()
    }
  }

  return {
    unlinkWallet: handleUnlinkWallet,
    linkWallet: linkWalletWithState,
  }
}
