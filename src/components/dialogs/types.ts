export type DialogType = "email" | "edit_profile"
export type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & T
