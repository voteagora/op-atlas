"use client"

import { User } from "@prisma/client"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import { Button } from "@/components/ui/button"
import { CitizenshipQualification } from "@/lib/types"

type Props = {
  user: User
  qualification: CitizenshipQualification
}

export const SidebarActiveCitizen = ({ user, qualification }: Props) => {
  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <EligibleCitizenAvatar user={user} qualification={qualification} />

      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-secondary-foreground">
          You are a citizen!
        </div>

        <div className="text-sm text-secondary-foreground">
          You&apos;ll receive emails about active proposals.
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button className="w-full button-primary" onClick={() => {}}>
          Start participating
        </Button>

        <Button
          className="w-full button-outline"
          disabled={false}
          onClick={() => {}}
        >
          Resign
        </Button>
      </div>
    </div>
  )
}
