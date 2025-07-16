"use client"

import { Citizen, User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import { Button } from "@/components/ui/button"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { deleteCitizen } from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

type Props = {
  user: User
  qualification: CitizenshipQualification
  citizen: Citizen
}

export const SidebarActiveCitizen = ({
  user,
  qualification,
  citizen,
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { invalidate } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: user.id },
    enabled: false,
  })

  const handleResign = async () => {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("Resigning citizenship")
        const result = await deleteCitizen(citizen.id)

        if (result.error) {
          toast.dismiss(loadingToast)
          toast.error(result.error)
          return
        }

        await invalidate()
        toast.dismiss(loadingToast)
        toast.success("Citizenship resigned")
        router.refresh()
      } catch (error) {
        toast.error("Failed to resign citizenship")
      }
    })
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <EligibleCitizenAvatar user={user} qualification={qualification} />

      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-secondary-foreground">
          You are a citizen!
        </div>

        <div className="text-sm text-secondary-foreground">
          You&apos;ll receive emails about active proposals.
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button className="w-full button-primary" onClick={() => {}}>
          Start participating
        </Button>

        <Button
          className="w-full button-outline"
          disabled={isPending}
          onClick={handleResign}
        >
          Resign
        </Button>
      </div>
    </div>
  )
}
