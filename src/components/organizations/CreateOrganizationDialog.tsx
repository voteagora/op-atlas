"use client"

import { memo } from "react"

import { DialogProps } from "../dialogs/types"
import AddOrganizationNameSection from "./AddOrganizationNameContent"

function CreateOrganizationDialog({ open, onOpenChange }: DialogProps<object>) {
  return <AddOrganizationNameSection open={open} onOpenChange={onOpenChange} />
}

export default memo(CreateOrganizationDialog)
