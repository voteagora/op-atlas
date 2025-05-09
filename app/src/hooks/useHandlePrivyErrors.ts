import { signOut } from "next-auth/react"
import { toast } from "sonner"

export const useHandlePrivyErrors = () => {
  return (error: string) => {
    switch (error) {
      case "must_be_authenticated":
        toast.error("Session expired. Please sign in again.")
        return signOut()

      case "failed_to_update_account":
        return toast.error(
          "Failed to update account. Please refresh the page and try again.",
        )

      case "failed_to_link_account":
        return toast.error(
          "Failed to link account. Please refresh the page and try again.",
        )

      case "linked_to_another_user":
        return toast.error("Account already linked to another user.")

      case "exited_update_flow":
      case "exited_link_flow":
        return

      default:
        toast.error(`Privy Error: ${error}`)
    }
  }
}
