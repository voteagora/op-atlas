"use client"

import { UserPassport } from "@prisma/client"

import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"
import { CITIZEN_TYPES, VALID_PASSPORT_THRESHOLD } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

import { useUserWorldId } from "../db/useUserWorldId"

export const useCitizenshipRequirements = ({
  id,
  qualification,
}: {
  id: string
  qualification: CitizenshipQualification
}) => {
  const { user, isLoading: isUserLoading } = useUser({ id })
  const { data: passports, isLoading: isPassportsLoading } = useUserPassports({
    id,
    enabled:
      qualification.eligible && qualification.type === CITIZEN_TYPES.user,
  })
  const { data: worldId, isLoading: isWorldIdLoading } = useUserWorldId({
    id,
    enabled:
      qualification.eligible && qualification.type === CITIZEN_TYPES.user,
  })

  const isLoading =
    isUserLoading ||
    (qualification.type === CITIZEN_TYPES.user &&
      (isPassportsLoading || isWorldIdLoading))

  if (
    isLoading ||
    !user ||
    (qualification.type === CITIZEN_TYPES.user && !passports)
  ) {
    return { isLoading, hasMetRequirements: false }
  }

  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr) => addr.primary)
  const passport = passports?.find(
    (passport: UserPassport) =>
      Number(passport.score) >= VALID_PASSPORT_THRESHOLD,
  )
  const validPassport = Boolean(passport)
  const validWorldId = Boolean(worldId?.verified)

  let hasMetRequirements = false

  if (qualification.type !== CITIZEN_TYPES.user) {
    hasMetRequirements = Boolean(email && govAddress)
  } else {
    hasMetRequirements = Boolean(
      email &&
        (user?.github || user?.notDeveloper) &&
        govAddress &&
        (validPassport || validWorldId),
    )
  }

  return { isLoading, hasMetRequirements }
}
