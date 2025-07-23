import { User } from "@prisma/client"
import Image from "next/image"

import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

import { UserAvatar } from "./UserAvatar"

export const EligibleCitizenAvatar = ({
  user,
  qualification,
  size,
}: {
  user: User
  qualification: CitizenshipQualification
  size?: "sm" | "lg"
}) => {
  if (qualification.type === CITIZEN_TYPES.user) {
    return <UserAvatar imageUrl={user?.imageUrl} size={size} />
  }

  let imgSize = 64
  switch (size) {
    case "sm":
      imgSize = 20
      break
  }

  return qualification.avatar ? (
    <Image
      className={`w-[${imgSize}px] h-[${imgSize}px] rounded-md`}
      src={qualification.avatar || ""}
      alt={qualification.title}
      width={imgSize}
      height={imgSize}
    />
  ) : (
    <div className="w-[64px] h-[64px] rounded-md bg-muted" />
  )
}
