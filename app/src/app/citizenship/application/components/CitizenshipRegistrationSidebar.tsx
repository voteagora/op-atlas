"use client"

import { User } from "@prisma/client"
import { useState } from "react"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import CitizenshipRulesDialog from "@/components/dialogs/CitizenshipRulesDialog"
import { Button } from "@/components/ui/button"
import { useCitizenshipRequirements } from "@/hooks/useCitizenshipRequirements"

export const CitizenshipRegistrationSidebar = ({ user }: { user: User }) => {
  const isEligible = useCitizenshipRequirements({ id: user.id })
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <UserAvatarLarge imageUrl={user?.imageUrl} />
      <div className="text-sm font-semibold text-secondary-foreground">
        You are eligible to become a Citizen
      </div>

      {!isEligible && (
        <div className="text-sm text-destructive">
          {" "}
          Complete your registration requirements in order to continue
        </div>
      )}

      <Button
        className="w-full button-primary"
        disabled={!isEligible}
        onClick={() => setIsRulesDialogOpen(true)}
      >
        Register
      </Button>

      <CitizenshipRulesDialog
        open={isRulesDialogOpen}
        onOpenChange={setIsRulesDialogOpen}
      />
    </div>
  )
}
