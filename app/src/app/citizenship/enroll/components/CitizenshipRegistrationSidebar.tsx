"use client"


import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import { Button } from "@/components/ui/button"
import { useCitizenshipRequirements } from "@/hooks/useCitizenshipRequirements"
import { User } from "@prisma/client"

export const CitizenshipRegistrationSidebar = ({ user }: { user: User }) => {
    const isEligible = useCitizenshipRequirements({ id: user.id })

    return (
        <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
            <UserAvatarLarge imageUrl={user?.imageUrl} />
            <div className="text-sm font-semibold text-secondary-foreground">You are eligible to become a Citizen</div>

            {!isEligible &&
                <div className="text-sm text-destructive"> Complete your registration requirements in order to continue</div>
            }

            <Button className="w-full button-primary" disabled={!isEligible}>
                Register
            </Button>
        </div >
    )
}