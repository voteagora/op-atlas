export function getPrivyErrorMessage(errorCode: string): string | null {
  switch (errorCode) {
    case "must_be_authenticated":
      return "Session expired. Please sign in again."

    case "failed_to_update_account":
      return "Failed to update account. Please refresh the page and try again."

    case "failed_to_link_account":
      return "Failed to link account. Please refresh the page and try again."

    case "linked_to_another_user":
      return "Account already linked to another user."

    case "exited_update_flow":
    case "exited_link_flow":
      return null

    default:
      return `Privy Error: ${errorCode}`
  }
}
