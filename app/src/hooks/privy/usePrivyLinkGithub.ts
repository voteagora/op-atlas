import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useRef } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { setUserIsNotDeveloper } from "@/lib/actions/users"

export const usePrivyLinkGithub = (userId: string) => {

    const isLinking = useRef(false)
    const { user: privyUser, unlinkGithub } = usePrivy()
    const { user, invalidate: invalidateUser } = useUser({ id: userId, enabled: true })
    const onError = useHandlePrivyErrors()

    const handleUnlinkGithub = () => {
        if (privyUser?.github?.subject) {
            toast.promise(unlinkGithub(privyUser.github.subject), {
                loading: "Unlinking github...",
                success: (updatedPrivyUser) => {
                    syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
                    return "Github unlinked successfully"
                },
                error: (error) => {
                    return error.message
                },
            })
        }
    }

    const { linkGithub } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
            if (linkMethod === "github" && isLinking.current) {
                toast.promise(
                    syncPrivyUser(updatedPrivyUser)
                        .then(() => invalidateUser())
                        .then(() => (isLinking.current = false)),
                    {
                        loading: "Linking github...",
                        success: "Github linked successfully",
                        error: "Failed to link github",
                    },
                )
            }
        },
        onError,
    })

    const linkGithubWithState = () => {
        isLinking.current = true
        linkGithub()
    }

    const toggleIsDeveloper = () => {
        const desiredState = !user?.notDeveloper

        toast.promise(setUserIsNotDeveloper(desiredState), {
            loading: "Updating developer status...",
            success: () => {
                if (desiredState && privyUser?.github?.subject) {
                    handleUnlinkGithub()
                } else {
                    invalidateUser()
                }
                return "Developer status updated successfully"
            },
            error: "Failed to update developer status",
        })
    }

    return {
        linkGithub: linkGithubWithState,
        unlinkGithub: handleUnlinkGithub,
        toggleIsDeveloper,
    }
} 