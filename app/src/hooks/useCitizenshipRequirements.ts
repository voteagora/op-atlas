"use client"

import { UserPassport } from "@prisma/client"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"

export const useCitizenshipRequirements = ({ id }: { id: string }) => {
  const { user } = useUser({ id })
  const { data: citizen } = useCitizen({ userId: id })
  const { data: passports } = useUserPassports({ id })

  if (!user || !passports) {
    return false
  }

  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr) => addr.primary)
  const passport = passports?.find(
    (passport: UserPassport) => Number(passport.score) >= 20.0,
  )
  const validPassport = Boolean(passport)
  const validTimeCommitment = Boolean(citizen?.timeCommitment)

  return Boolean(
    email &&
      (user?.github || user?.notDeveloper) &&
      govAddress &&
      validPassport &&
      validTimeCommitment,
  )
}
