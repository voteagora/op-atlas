"use client"

import { User } from "@prisma/client"
import { useState } from "react"

import CitizenshipRulesDialog from "@/components/dialogs/CitizenshipRulesDialog"
import { Button } from "@/components/ui/button"
import { useCitizenshipRequirements } from "@/hooks/useCitizenshipRequirements"

export const Sidebar = ({ user }: { user: User }) => {
  const isEligible = useCitizenshipRequirements({ id: user.id })
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <div className="w-[64px] h-[64px] bg-black rounded-md"></div>
      <div className="text-sm font-semibold text-secondary-foreground">
        [Project] is eligible to become a Citizen
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
