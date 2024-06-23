"use client"

import { useAppDialogs } from "@/providers/DialogProvider"

import { VerifyAddressDialog } from "../projects/contracts/VerifyAddressDialog"
import { AddVerifiedAddressDialog } from "./AddVerifiedAddressDialog"
import EditProfileDialog from "./EditProfileDialog"
import EmailDialog from "./EmailDialog"
import { GetStartedDialog } from "./GetStartedDialog"
import { DialogType } from "./types"
import WelcomeBadgeholderDialog from "./WelcomeBadgeholderDialog"

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
      {openDialog === "get_started" && (
        <GetStartedDialog open onOpenChange={onOpenChange("get_started")} />
      )}
      {openDialog === "verify_address" && (
        <AddVerifiedAddressDialog
          open
          onOpenChange={onOpenChange("verify_address")}
        />
      )}
      {openDialog === "welcome_badgeholder" && (
        <WelcomeBadgeholderDialog
          open
          onOpenChange={onOpenChange("welcome_badgeholder")}
        />
      )}
    </>
  )
}
