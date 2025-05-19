"use client"

import { useUserPOH } from "@/hooks/db/useUserPOH"

export function ProofOfHumanity({ userId }: { userId: string }) {
    const { userPOH } = useUserPOH({ id: userId })

    return (
        <div>
            <h1>Proof of Humanity</h1>
            {userPOH?.map((poh) => (
                <div key={poh.id}>
                    <p>{poh.source}</p>
                    <p>{poh.sourceId}</p>
                </div>
            ))}
        </div>
    )
}