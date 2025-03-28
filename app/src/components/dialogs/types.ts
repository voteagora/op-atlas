export type DialogType =
  | "email"
  | "edit_profile"
  | "get_started"
  | "verify_address"
  | "verify_grant_delivery_address"
  | "welcome_badgeholder"
  | "governance_testimonial_request"
  | "not_recognized_address"
  | "select_kyc_project"
  | "claim_rewards"
export type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & T
