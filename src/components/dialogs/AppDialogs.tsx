"use client"

import { useAppDialogs } from "@/providers/DialogProvider"

import EditProfileDialog from "./EditProfileDialog"
import EmailDialog from "./EmailDialog"
import { DialogType } from "./types"

export default function AppDialogs() {
  const { openDialog, setOpenDialog } = useAppDialogs()
  const onOpenChange = (type: DialogType) => (open: boolean) =>
    setOpenDialog(open ? type : undefined)

  return (
    <>
      <EmailDialog
        open={openDialog === "email"}
        onOpenChange={onOpenChange("email")}
      />
      <EditProfileDialog
        open={openDialog === "edit_profile"}
        onOpenChange={onOpenChange("edit_profile")}
      />
    </>
  )
}
