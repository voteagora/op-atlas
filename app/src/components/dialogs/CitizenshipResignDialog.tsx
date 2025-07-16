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

import { DialogProps } from "./types"

type Props = DialogProps<{
  citizenId: number
  userId: string
}>

export default function CitizenshipResignDialog({
  open,
  onOpenChange,
  citizenId,
  userId,
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
        const loadingToast = toast.loading("Resigning citizenship")
        const result = await deleteCitizen(citizenId)

        if (result.error) {
          toast.dismiss(loadingToast)
          toast.error(result.error)
          return
        }

        await invalidate()
        toast.dismiss(loadingToast)
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
          Resign your position in the Citizen&apos;s House?
        </DialogTitle>

        <div>
          {isPending ? (
            <div className="my-4 flex flex-col gap-4 justify-center items-center">
              <div className="text-muted-foreground text-center">
                Resigning citizenship...
              </div>
              <Loader2 className="animate-spin mx-auto text-foreground-muted w-6 h-6" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={handleResign}
                className="w-full button-primary"
                disabled={isPending}
              >
                Resign
              </Button>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full button-outline"
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
