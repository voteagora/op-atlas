"use client"

import { Ellipsis } from "lucide-react"
import { useParams } from "next/navigation"

import { StatusIcon } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { ExtendedPersonaStatus } from "@/components/projects/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDialogs } from "@/providers/DialogProvider"

const ProjectStatus = ({
  status,
  kycTeamId,
}: {
  status: ExtendedPersonaStatus
  kycTeamId?: string
}) => {
  const { organizationId, projectId } = useParams()
  const { setData, setOpenDialog } = useAppDialogs()

  const openDeleteKYCTeamDialog = () => {
    setData({
      kycTeamId,
      projectId: projectId as string,
      organizationId: organizationId as string,
      hasActiveStream: false,
    })
    setOpenDialog("delete_kyc_team")
  }

  if (status === "APPROVED") {
    return null
  }
  return (
    <div className="w-full max-w-[664px] h-[176px] rounded-[6px] p-6 gap-3 justify-center items-center flex flex-col relative">
      {status !== "PENDING" && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="h-5 w-5 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openDeleteKYCTeamDialog}
              >
                Remove address
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className={"text-center"}>
        <StatusIcon status={status} size={6} />
      </div>
      {status === "PENDING" ? (
        <>
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-center text-text-foreground">
            We are checking for verifications
          </p>
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-center tracking-[0%] text-text-secondary">
            An email from compliance@optimism.io has been sent to each person
            declared in the grant eligibility form. They must complete KYC/KYB
            via the link provided. Please ensure everyone has taken action and
            allow 48 hours for your status to update.
          </p>
        </>
      ) : (
        <>
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-center text-text-destructive">
            Your grant delivery address cannot be verified
          </p>
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-center tracking-[0%] text-text-destructive">
            One or more of the associated parties is having an issue with their
            verification process. Please reach out to us at&nbsp;
            <a href="mailto:compliance@optimism.io" className="underline">
              compliance@optimism.io
            </a>
            &nbsp;for assistance.
          </p>
        </>
      )}
    </div>
  )
}

export default ProjectStatus
