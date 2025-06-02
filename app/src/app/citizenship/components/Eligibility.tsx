"use client"

import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import { Button } from "@/components/ui/button"
import { useCitizenQualifications } from "@/hooks/citizen/useCitizenQualification"
import { CITIZEN_TYPES } from "@/lib/constants"

export const Eligibility = ({ user }: { user: User }) => {
  const { data: qualification } = useCitizenQualifications()
  const router = useRouter()

  const renderAvatar = () => {
    switch (qualification?.type) {
      case CITIZEN_TYPES.chain:
        return <div className="w-[64px] h-[64px] bg-black rounded-md"></div>
      case CITIZEN_TYPES.project:
        return <div className="w-[64px] h-[64px] bg-red rounded-md"></div>
      default:
        return <UserAvatarLarge imageUrl={user?.imageUrl} />
    }
  }

  const renderCopy = () => {
    switch (qualification?.type) {
      case CITIZEN_TYPES.chain:
        return "You qualify for Season 8 Citizenship through your organization"
      case CITIZEN_TYPES.project:
        return "You qualify for Season 8 Citizenship through your project"
      case CITIZEN_TYPES.user:
        return "You qualify for Season 8 Citizenship"
      default:
        return "Sorry, you are not eligible to become a Citizen"
    }
  }

  if (!qualification) {
    return (
      <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
        {renderAvatar()}
        <div className="text-sm font-semibold text-secondary-foreground">
          {renderCopy()}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      {renderAvatar()}
      <div className="text-sm font-semibold text-secondary-foreground">
        {renderCopy()}
      </div>

      <Button
        className="w-full button-primary"
        onClick={() => {
          router.push("/citizenship/application")
        }}
      >
        Register
      </Button>
    </div>
  )
}
