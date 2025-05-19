"use client"

import { useUserPOH } from "@/hooks/db/useUserPOH"
import { Passport } from "../icons/socials"
import { WorldConnection } from "./WorldIdConnection"
import { World } from "../icons/socials"
import PassportConnection from "./PassportConnection"
import CircleWithCheckmark from "@/components/common/CircleWithGreenCheckmark"
import Image from "next/image"
export function ProofOfHumanity({ userId }: { userId: string }) {
    const { data: userPOH } = useUserPOH({ id: userId })

    const hasWorld = userPOH?.some((poh) => poh.source === 'world')
    const hasPassport = userPOH?.some((poh) => poh.source === 'passport')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {hasWorld && (
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/icons/circle-check-green.svg"
                            height={16.67}
                            width={16.67}
                            alt="Verified"
                        />
                        <span>Verified with World ID</span>
                    </div>
                )}
                {hasPassport && (
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/icons/circle-check-green.svg"
                            height={16.67}
                            width={16.67}
                            alt="Verified"
                        />
                        <span>Verified with Passport</span>
                    </div>
                )}
            </div>

            <div className="flex flex-row gap-2 items-center ">
                {!hasWorld && (
                    <WorldConnection userId={userId}>
                        <div className="flex flex-row gap-2 items-center">
                            <World fill="#FFFFFF" className="w-5 h-5" />
                            <div>Verify with World ID</div>
                        </div>
                    </WorldConnection>
                )}
                {!hasPassport && (
                    <PassportConnection userId={userId}>
                        <div className="flex flex-row gap-2 items-center">
                            <Passport fill="#FFFFFF" className="w-5 h-5" />
                            <div>Verify with Passport</div>
                        </div>
                    </PassportConnection>
                )}
            </div>
        </div>
    )
}