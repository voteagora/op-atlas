"use client"

import { syncPrivyUser } from "@/db/privy"
import { UserWithAddresses } from "@/lib/types"
import { useLinkAccount } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "../common/Button"

interface Props {
    children?: ReactNode
    user: UserWithAddresses
}

export const AddressConnection = ({ children, user }: Props) => {

    const queryClient = useQueryClient()

    const { linkWallet } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser }) => {
            if (updatedPrivyUser) {
                toast.promise(
                    syncPrivyUser(updatedPrivyUser)
                        .then(() => queryClient.invalidateQueries({ queryKey: ["user", user.id] }))
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
