export type DialogType = "email" | "edit_profile" | "get_started"
export type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & T
