"use client"

import { useAppDialogs } from "@/providers/DialogProvider"
import EmailDialog from "./EmailDialog"
import { DialogType } from "./types"
import EditProfileDialog from "./EditProfileDialog"

export default function AppDialogs() {
  const { openDialog, setOpenDialog } = useAppDialogs()
  const onOpenChange = (type: DialogType) => (open: boolean) =>
    setOpenDialog(open ? type : undefined)

  return (
    <>
      {openDialog === "email" && (
        <EmailDialog open onOpenChange={onOpenChange("email")} />
      )}
      {openDialog === "edit_profile" && (
        <EditProfileDialog open onOpenChange={onOpenChange("edit_profile")} />
      )}
    </>
  )
}
