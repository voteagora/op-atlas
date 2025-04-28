"use client"

import { syncPrivyUser } from "@/db/privy"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
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
    const onError = useHandlePrivyErrors()

    const { linkWallet } = useLinkAccount({
        onSuccess: ({ user: updatedPrivyUser, linkedAccount }) => {
            if (linkedAccount.type === "wallet") {
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
        },
        onError
    })

    return (
        <Button variant="primary" onClick={() => linkWallet()}>
            {children}
        </Button>
    )
}
