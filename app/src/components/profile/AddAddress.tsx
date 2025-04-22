import { syncPrivyUser } from "@/db/users"
import { useLinkAccount } from "@privy-io/react-auth"
import { toast } from "sonner"
import { Button } from "../common/Button"
import { ReactNode } from "react"

interface Props {
    children?: ReactNode
}

export const AddAddress = ({ children }: Props) => {

    const { linkWallet } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser }) => {
            if (updatedPrivyUser) {
                toast.promise(syncPrivyUser(updatedPrivyUser), {
                    loading: "Addding wallet address...",
                    success: "Wallet address added successfully",
                    error: "Failed to add wallet address",
                })
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
