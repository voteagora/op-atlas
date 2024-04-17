"use client"

import { useAppDialogs } from "@/providers/DialogProvider"
import EmailDialog from "./EmailDialog"
import { DialogType } from "./types"

export default function AppDialogs() {
  const { openDialog, setOpenDialog } = useAppDialogs()
  const onOpenChange = (type: DialogType) => (open: boolean) =>
    setOpenDialog(open ? type : undefined)

  return (
    <EmailDialog
      open={openDialog === "email"}
      onOpenChange={onOpenChange("email")}
    />
  )
}
