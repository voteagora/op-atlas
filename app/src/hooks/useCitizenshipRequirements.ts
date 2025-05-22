"use client"

import { useUser } from "@/hooks/db/useUser"
import { useUserPOH } from "@/hooks/db/useUserPOH"
import { UserPOH } from "@/lib/types"

export const useCitizenshipRequirements = ({ id }: { id: string }) => {
    const { user } = useUser({ id })
    const { data: pohData } = useUserPOH({ id })

    if (!user || !pohData) {
        return false
    }

    const email = user?.emails?.[0]
    const govAddress = user?.addresses?.find((addr) => addr.primary)
    const passport = pohData?.find((poh: UserPOH) => poh.source === "passport")
    const validPassport = Boolean(passport && passport.sourceMeta?.score > passport.sourceMeta?.threshold)

    return Boolean(email && (user?.github || user?.notDeveloper) && govAddress && validPassport)
}
