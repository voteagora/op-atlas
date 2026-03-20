import { signOut } from "next-auth/react"
import { toast } from "sonner"

import { getPrivyErrorMessage } from "@/hooks/privy/privyErrorMessages"

export const useHandlePrivyErrors = () => {
  return (errorCode: string) => {
    const message = getPrivyErrorMessage(errorCode)

    if (errorCode === "must_be_authenticated") {
      if (message) {
        toast.error(message, { id: `privy-error-${errorCode}` })
      }
      return signOut()
    }

    if (message) {
      return toast.error(message, { id: `privy-error-${errorCode}` })
    }
  }
}
