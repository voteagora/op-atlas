"use client"

import { Role } from "@prisma/client"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function RoleSidebar({ role }: { role: Role }) {
    const { data: session } = useSession()


    const isActive =
        role.startAt &&
        role.endAt &&
        new Date() >= new Date(role.startAt) &&
        new Date() <= new Date(role.endAt)

    const handleApply = () => {

    }

    if (!isActive) {
        return (
            <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
                <div className="flex flex-col gap-2">
                    <div className="font-semibold text-secondary-foreground">
                        Nominations are not open
                    </div>
                    <div className="text-sm text-secondary-foreground">
                        This role is not currently accepting nominations. Please check back
                        later.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
            <div className="flex flex-col gap-2">
                <div className="font-semibold text-secondary-foreground">
                    Ready to apply?
                </div>
                <div className="text-sm text-secondary-foreground">
                    Submit your self-nomination for this role.
                </div>
            </div>

            <Button
                className="w-full button-primary"
                disabled={!session?.user}
                onClick={handleApply}
            >
                {session?.user ? "Apply Now" : "Sign in to Apply"}
            </Button>
        </div>
    )
} 