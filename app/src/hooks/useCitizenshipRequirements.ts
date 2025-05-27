"use client"

import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"
import { UserPassport } from "@prisma/client"

export const useCitizenshipRequirements = ({ id }: { id: string }) => {
    const { user } = useUser({ id })
    const { data: passports } = useUserPassports({ id })

    if (!user || !passports) {
        return false
    }

    const email = user?.emails?.[0]
    const govAddress = user?.addresses?.find((addr) => addr.primary)
    const passport = passports?.find((passport: UserPassport) => Number(passport.score) >= 20.0)
    const validPassport = Boolean(passport)

    return Boolean(email && (user?.github || user?.notDeveloper) && govAddress && validPassport)
}
