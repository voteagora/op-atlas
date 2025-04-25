"use client"

import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
import { UserWithAddresses } from "@/lib/types"
import { useLinkAccount } from "@privy-io/react-auth"
import { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "../common/Button"

interface Props {
    children?: ReactNode
    user: UserWithAddresses
}

export const AddressConnection = ({ children, user }: Props) => {

    const { invalidate: invalidateUser } = useUser({ id: user.id, enabled: false })

    const { linkWallet } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser }) => {
            if (updatedPrivyUser) {
                toast.promise(
                    syncPrivyUser(updatedPrivyUser)
                        .then(() => invalidateUser())
                    , {
                        loading: "Adding wallet address...",
                        success: "Wallet address added successfully",
                        error: "Failed to add wallet address",
                    }
                )
            }
        }
    })

    return (
        <Button variant="primary" onClick={() => {
            linkWallet()
        }}>
            {children}
        </Button>
    )
}
