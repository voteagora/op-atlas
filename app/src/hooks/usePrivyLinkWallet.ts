import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"
import { useUser } from "./useUser"
import { syncPrivyUser } from "@/db/privy"
import { useHandlePrivyErrors } from "./useHandlePrivyErrors"
import { useRef } from "react"

export const usePrivyLinkWallet = (userId: string) => {
  const isLinking = useRef(false)
  const { unlinkWallet } = usePrivy()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const onError = useHandlePrivyErrors()

  const handleUnlinkWallet = (address: string) => {
    toast.promise(unlinkWallet(address), {
      loading: "Removing wallet address...",
      success: (updatedPrivyUser) => {
        syncPrivyUser(updatedPrivyUser).then(() => {
          invalidateUser()
        })
        return "Wallet address removed successfully"
      },
      error: "Failed to remove wallet address",
    })
  }

  const { linkWallet } = useLinkAccount({
    onSuccess: ({ user: updatedPrivyUser, linkedAccount }) => {
      if (linkedAccount.type === "wallet" && !isLinking.current) {
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
  const linkWalletWithState = () => {
    isLinking.current = true
    linkWallet()
  }

  return {
    unlinkWallet: handleUnlinkWallet,
    linkWallet: linkWalletWithState,
  }
}
