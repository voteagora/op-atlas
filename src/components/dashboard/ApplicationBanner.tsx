import { Application } from "@prisma/client"
import { format } from "date-fns"
import { Ellipsis } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import React, { memo, useState } from "react"

import { cn, EAS_URL_PREFIX } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const ApplicationBanner = ({
  className,
  application,
  canApply,
}: {
  className?: string
  application?: Application
  canApply: boolean
}) => {
  const router = useRouter()
  const { data } = useSession()
  const { setOpenDialog } = useAppDialogs()
  const [loadingNextPage, setLoadingNextPage] = useState(false)

  const onViewApplication = () => {
    setLoadingNextPage(true)
    router.push("/application")
  }

  const onViewAttestation = () => {
    if (application) {
      window.open(`${EAS_URL_PREFIX}${application.attestationId}`, "_blank")
    }
  }

  const onClickApply = () => {
    if (data?.user?.email) {
      setLoadingNextPage(true)
      router.push("/application")
    } else {
      setOpenDialog("email")
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-x-4 border rounded-xl p-4 justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Image
          alt=""
          src="/assets/icons/applyTileIcon.svg"
          width={64}
          height={67}
        />
        <div className="flex flex-col">
          <p className="font-medium">Retro Funding Round 4: Onchain Builders</p>
          {application ? (
            <div className="flex items-center gap-1">
              <Image
                src="/assets/icons/circle-check-green.svg"
                height={16}
                width={16}
                alt="Submitted"
              />
              <p className="text-secondary-foreground">
                Applied, {format(application.createdAt, "MMM d, h:mm a")}
              </p>
            </div>
          ) : (
            <p className="text-secondary-foreground">
              Submit your application by June 6.
            </p>
          )}
        </div>
      </div>

      {application ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="ml-auto">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={onViewApplication}
              >
                View application
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={onViewAttestation}
              >
                View attestation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button
          isLoading={loadingNextPage}
          onClick={onClickApply}
          variant={canApply ? "destructive" : "secondary"}
        >
          {canApply ? "Apply" : "View application"}
        </Button>
      )}
    </div>
  )
}

export default memo(ApplicationBanner)
