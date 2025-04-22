"use client"

import { useAppDialogs } from "@/providers/DialogProvider"

import { DeleteKYCTeamDialog } from "../projects/rewards/DeleteKYCTeamDialog"
import { AddGrantDeliveryAddressDialog } from "./AddGrantDeliveryAddressDialog"
import { AddVerifiedAddressDialog } from "./AddVerifiedAddressDialog"
import ClaimRewardsDialog from "./ClaimRewardsDialog"
import EditProfileDialog from "./EditProfileDialog"
import EmailDialog from "./EmailDialog"
import { GetStartedDialog } from "./GetStartedDialog"
import GovernanceTestimonialRequestDialog from "./GovernanceTestimonialRequestDialog"
import NotRecognizedAddressDialog from "./NotRecognizedAddressDialog"
import SelectKYCProjectDialog from "./SelectKYCProjectDialog"
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
      {openDialog === "verify_grant_delivery_address" && (
        <AddGrantDeliveryAddressDialog
          open
          onOpenChange={onOpenChange("verify_grant_delivery_address")}
        />
      )}
      {openDialog === "welcome_badgeholder" && (
        <WelcomeBadgeholderDialog
          open
          onOpenChange={onOpenChange("welcome_badgeholder")}
        />
      )}
      {openDialog === "governance_testimonial_request" && (
        <GovernanceTestimonialRequestDialog
          open
          onOpenChange={onOpenChange("governance_testimonial_request")}
        />
      )}
      {openDialog === "not_recognized_address" && (
        <NotRecognizedAddressDialog
          open
          onOpenChange={onOpenChange("not_recognized_address")}
        />
      )}
      {openDialog === "select_kyc_project" && (
        <SelectKYCProjectDialog
          open
          onOpenChange={onOpenChange("select_kyc_project")}
        />
      )}
      {openDialog === "claim_rewards" && (
        <ClaimRewardsDialog open onOpenChange={onOpenChange("claim_rewards")} />
      )}
      {openDialog === "delete_kyc_team" && (
        <DeleteKYCTeamDialog
          open
          onOpenChange={onOpenChange("delete_kyc_team")}
        />
      )}
    </>
  )
}
