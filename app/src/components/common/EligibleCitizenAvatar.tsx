import { User } from "@prisma/client"
import Image from "next/image"

import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

import { UserAvatarLarge } from "./UserAvatarLarge"

export const EligibleCitizenAvatar = ({
  user,
  qualification,
}: {
  user: User
  qualification: CitizenshipQualification
}) => {
  if (qualification.type === CITIZEN_TYPES.user) {
    return <UserAvatarLarge imageUrl={user?.imageUrl} />
  }

  return qualification.avatar ? (
    <Image
      className="w-[64px] h-[64px] rounded-md"
      src={qualification.avatar || ""}
      alt={qualification.title}
      width={64}
      height={64}
    />
  ) : (
    <div className="w-[64px] h-[64px] rounded-md bg-muted" />
  )
}
