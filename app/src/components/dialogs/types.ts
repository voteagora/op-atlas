export type DialogType =
  | "email"
  | "edit_profile"
  | "get_started"
  | "verify_address"
  | "welcome_badgeholder"
  | "governance_testimonial_request"
  | "not_recognized_address"
export type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & T
