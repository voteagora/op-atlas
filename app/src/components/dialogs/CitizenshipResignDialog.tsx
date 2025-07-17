"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { deleteCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"

import { CitizenshipQualification } from "@/lib/types"
import { DialogProps } from "./types"

type Props = DialogProps<{
    citizenId: number
    userId: string
    qualification: CitizenshipQualification
}>

export default function CitizenshipResignDialog({
    open,
    onOpenChange,
    citizenId,
    userId,
    qualification,
}: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { invalidate } = useCitizen({
        query: { type: CITIZEN_TYPES.user, id: userId },
        enabled: false,
    })

    const handleResign = async () => {
        startTransition(async () => {
            try {

                const result = await deleteCitizen(citizenId)

                if (result.error) {
                    toast.error(result.error)
                    return
                }

                await invalidate()
                toast.success("Citizenship resigned")
                router.refresh()
                onOpenChange(false)
            } catch (error) {
                toast.error("Failed to resign citizenship")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle className="text-center">
                    {qualification.type === CITIZEN_TYPES.user ? "Resign your position in the Citizen's House?" : "Edit or resign citizenship"}
                </DialogTitle>


                {qualification.type !== CITIZEN_TYPES.user &&
                    <div className="text-muted-foreground text-center">
                        To change the admin responsible for casting votes, you must resign and re-register under the desired admin.
                    </div>
                }

                <div className="flex flex-col gap-2 mt-2">
                    <Button
                        onClick={handleResign}
                        className="w-full button-primary"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin mx-auto text-foreground-muted w-6 h-6" />
                        ) : (
                            "Resign"
                        )}
                    </Button>

                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full button-outline"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
