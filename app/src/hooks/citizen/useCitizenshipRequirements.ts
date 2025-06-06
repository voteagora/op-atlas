"use client"

import { UserPassport } from "@prisma/client"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

import { useUserWorldId } from "../db/useUserWorldId"

export const useCitizenshipRequirements = ({
  id,
  qualification,
}: {
  id: string
  qualification: CitizenshipQualification
}) => {
  const { user } = useUser({ id })
  const { data: citizen } = useCitizen({ userId: id })
  const { data: passports } = useUserPassports({ id })
  const { data: worldId } = useUserWorldId({ id })

  if (!user || !passports) {
    return false
  }

  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr) => addr.primary)
  const passport = passports?.find(
    (passport: UserPassport) => Number(passport.score) >= 20.0,
  )
  const validPassport = Boolean(passport)
  const validWorldId = Boolean(worldId?.verified)
  const validTimeCommitment = Boolean(citizen?.timeCommitment)

  if (qualification.type !== CITIZEN_TYPES.user) {
    return Boolean(email && govAddress && validTimeCommitment)
  }

  return Boolean(
    email &&
      (user?.github || user?.notDeveloper) &&
      govAddress &&
      (validPassport || validWorldId) &&
      validTimeCommitment,
  )
}
