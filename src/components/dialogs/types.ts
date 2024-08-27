export type DialogType =
  | "email"
  | "edit_profile"
  | "get_started"
  | "verify_address"
  | "welcome_badgeholder"
export type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & T
