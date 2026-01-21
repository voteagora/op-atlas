"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { resignCitizenSeason } from "@/lib/actions/citizenship/resignCitizenSeason"

type ResignContext = {
  kind: "user" | "organization" | "project"
  entityName?: string
}

type S9ResignDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  citizenSeasonId: string
  context: ResignContext
}

export function S9ResignDialog({
  open,
  onOpenChange,
  citizenSeasonId,
  context,
}: S9ResignDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isUserContext = context.kind === "user"
  const title = isUserContext
    ? "Resign your position in the Citizens’ House?"
    : `Resign citizenship for ${context.entityName ?? "this entity"}?`

  const description = isUserContext
    ? "If you resign, you’ll stop receiving emails about active proposals. You’ll need to register again if you want to participate in the future."
    : "To change the admin responsible for casting votes, resign first and then re-register using the new governance address."

  const handleResign = () => {
    startTransition(async () => {
      const result = await resignCitizenSeason(citizenSeasonId)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Citizenship resigned")
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          <p className="text-sm text-secondary-foreground max-w-[360px]">
            {description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleResign}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resigning
              </span>
            ) : (
              "Resign"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
