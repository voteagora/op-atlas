"use client"

import { User } from "@prisma/client"
import { useState } from "react"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import CitizenshipApplicationDialog from "@/components/dialogs/CitizenshipApplicationDialog"
import { Button } from "@/components/ui/button"
import { useCitizenshipRequirements } from "@/hooks/citizen/useCitizenshipRequirements"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

export const Sidebar = ({
  user,
  qualification,
  redirectUrl,
}: {
  user: User
  qualification: CitizenshipQualification
  redirectUrl?: string
}) => {
  const { hasMetRequirements, isLoading } = useCitizenshipRequirements({
    id: user.id,
    qualification,
  })
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)

  const renderCopy = () => {
    if (qualification.type === CITIZEN_TYPES.user) {
      return qualification.eligible
        ? `You are eligible to become a Citizen`
        : qualification.error
    }

    if (qualification.type === CITIZEN_TYPES.chain) {
      return qualification.eligible
        ? `${qualification.title} is eligible to become a Citizen`
        : qualification.error
    }

    if (qualification.type === CITIZEN_TYPES.app) {
      return qualification.eligible
        ? `${qualification.title} is eligible to become a Citizen`
        : qualification.error
    }
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <EligibleCitizenAvatar user={user} qualification={qualification} />

      <div className="text-sm font-normal text-secondary-foreground">
        {renderCopy()}
      </div>

      {qualification.eligible && isLoading && (
        <div className="text-sm text-secondary-foreground">
          {" "}
          Checking requirements...
        </div>
      )}

      {qualification.eligible && !hasMetRequirements && !isLoading && (
        <div className="text-sm text-destructive">
          {" "}
          Complete your registration requirements in order to continue
        </div>
      )}

      {qualification.eligible && (
        <Button
          className="w-full button-primary"
          disabled={!hasMetRequirements || isLoading}
          onClick={() => setIsRulesDialogOpen(true)}
        >
          Register
        </Button>
      )}

      <CitizenshipApplicationDialog
        open={isRulesDialogOpen}
        onOpenChange={setIsRulesDialogOpen}
        redirectUrl={redirectUrl}
      />
    </div>
  )
}
