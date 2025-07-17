"use client"

import { Citizen, User } from "@prisma/client"
import Link from "next/link"
import { useState } from "react"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import CitizenshipResignDialog from "@/components/dialogs/CitizenshipResignDialog"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

type Props = {
    user: User
    qualification: CitizenshipQualification
    citizen: Citizen
}

export const SidebarActiveCitizen = ({
    user,
    qualification,
    citizen,
}: Props) => {
    const { user: citizenUser } = useUser({
        id: citizen.userId,
        enabled: qualification.type !== CITIZEN_TYPES.user,
    })
    const username = useUsername(citizenUser)

    const [isResignDialogOpen, setIsResignDialogOpen] = useState(false)

    return (
        <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
            <EligibleCitizenAvatar user={user} qualification={qualification} />

            <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-secondary-foreground">
                    {qualification.title} are a citizen!
                </div>

                {qualification.type === CITIZEN_TYPES.user ? (
                    <div className="text-sm text-secondary-foreground">
                        You&apos;ll receive emails about active proposals.
                    </div>
                ) : (
                    <div className="text-sm text-secondary-foreground">
                        <Link
                            target="_blank"
                            className="underline"
                            href={`/${citizenUser?.username}`}
                        >
                            {username}
                        </Link>{" "}
                        holds the voting badge for this app and is responsible for casting
                        votes.
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full">
                <Link href="/governance">
                    <Button className="w-full button-primary">Start participating</Button>
                </Link>

                <Button
                    className="w-full button-outline"
                    onClick={() => setIsResignDialogOpen(true)}
                >
                    {qualification.type === CITIZEN_TYPES.user ? "Resign" : "Edit or resign"}
                </Button>
            </div>

            <CitizenshipResignDialog
                open={isResignDialogOpen}
                onOpenChange={setIsResignDialogOpen}
                citizenId={citizen.id}
                qualification={qualification}
                userId={user.id}
            />
        </div>
    )
}
