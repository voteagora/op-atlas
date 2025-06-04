"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import { Button } from "@/components/ui/button"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { CITIZEN_TYPES } from "@/lib/constants"

export const Eligibility = ({ user }: { user: User }) => {
  const { data: qualification } = useCitizenQualification()
  const router = useRouter()

  if (!qualification) {
    return null
  }

  const renderAvatar = () => {
    switch (qualification?.type) {
      case CITIZEN_TYPES.chain:
        return (
          <Image
            className="w-[64px] h-[64px] bg-black rounded-md"
            src={qualification?.avatar}
            alt={qualification?.title}
            width={64}
            height={64}
          />
        )

      case CITIZEN_TYPES.app:
        return (
          <Image
            className="w-[64px] h-[64px] bg-red rounded-md"
            src={qualification?.avatar}
            alt={qualification?.title}
            width={64}
            height={64}
          />
        )

      default:
        return <UserAvatarLarge imageUrl={qualification?.avatar} />
    }
  }

  const renderCopy = () => {
    switch (qualification?.type) {
      case CITIZEN_TYPES.chain:
        return `${qualification.title} is eligible to become a Citizen`
      case CITIZEN_TYPES.app:
        return `${qualification.title} is eligible to become a Citizen`
      case CITIZEN_TYPES.user:
        return `${qualification.title} is eligible to become a Citizen`
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
