"use client"

import { Citizen } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { deleteCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { buildFrontendTraceContext } from "@/lib/mirador/clientTraceContext"
import {
  addMiradorEvent,
  closeMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace"

import { DialogProps } from "./types"

type Props = DialogProps<{
  citizen: Citizen
}>

export default function CitizenshipResignDialog({
  open,
  onOpenChange,
  citizen,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { invalidate } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: citizen.userId },
    enabled: false,
  })

  const isUserCitizen = citizen.type === CITIZEN_TYPES.user

  const handleResign = async () => {
    startTransition(async () => {
      const trace = startMiradorTrace({
        name: "CitizenResign",
        flow: MIRADOR_FLOW.citizenResign,
        context: {
          source: "frontend",
          userId: citizen.userId,
          sessionId: citizen.userId,
        },
        tags: ["citizen", "resign", "frontend"],
      })

      addMiradorEvent(trace, "citizen_resign_submit_started", {
        citizenId: citizen.id,
      })

      try {
        const traceContext = buildFrontendTraceContext(trace, {
          flow: MIRADOR_FLOW.citizenResign,
          step: "citizen_resign_submit",
          userId: citizen.userId,
          sessionId: citizen.userId,
        })

        const result = await deleteCitizen(citizen.id, traceContext)

        if (result.error) {
          addMiradorEvent(trace, "citizen_resign_submit_failed", {
            citizenId: citizen.id,
            error: result.error,
          })
          await closeMiradorTrace(trace, "Citizen resign failed")
          toast.error(result.error)
          return
        }

        await invalidate()
        addMiradorEvent(trace, "citizen_resign_submit_succeeded", {
          citizenId: citizen.id,
        })
        await closeMiradorTrace(trace, "Citizen resign succeeded")
        toast.success("Citizenship resigned")
        router.refresh()
        onOpenChange(false)
      } catch (error) {
        addMiradorEvent(trace, "citizen_resign_submit_failed", {
          citizenId: citizen.id,
          error: error instanceof Error ? error.message : String(error),
        })
        await closeMiradorTrace(trace, "Citizen resign failed")
        toast.error("Failed to resign citizenship")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">
          {isUserCitizen
            ? "Resign your position in the Citizens' House?"
            : "Edit or resign citizenship"}
        </DialogTitle>

        {!isUserCitizen && (
          <div className="text-muted-foreground text-center">
            To change the admin responsible for casting votes, you must resign
            and re-register under the desired admin.
          </div>
        )}

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
