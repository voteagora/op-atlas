"use client"

import { KYCUser } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, ChevronRight, SquareCheck } from "lucide-react"
import { User } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"

import Accordion from "@/components/common/Accordion"
import { Button } from "@/components/common/Button"
import { deleteOrganizationKycTeam } from "@/db/organizations"
import {
  deleteProjectKYCTeamAction,
  getProjectKYCTeamsAction,
} from "@/lib/actions/projects"
import { shortenAddress } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

interface CompletedGrantDeliveryFormProps {
  kycTeam?: {
    id?: string
    grantAddress?: {
      address: string
      validUntil: string
    }
  }
  teamMembers?: KYCUser[]
  entities?: KYCUser[]
  organizationProject?: boolean
}

export default function CompletedGrantDeliveryForm({
  kycTeam,
  organizationProject,
  teamMembers,
  entities,
}: CompletedGrantDeliveryFormProps) {
  const params = useParams()
  const queryClient = useQueryClient()
  const { setData, setOpenDialog } = useAppDialogs()
  const { data: kycTeamProjects } = useQuery({
    queryKey: ["kycTeamProjects", kycTeam?.id],
    queryFn: async () => {
      if (!kycTeam?.id) return []

      return getProjectKYCTeamsAction(kycTeam.id)
    },
  })
  const { mutate: deleteProjectKYCTeam, isPending } = useMutation({
    mutationFn: async () => {
      if (!organizationProject) {
        const projectId = params.projectId as string
        await deleteProjectKYCTeamAction({
          kycTeamId: kycTeam?.id ?? "",
          projectId,
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "project", projectId],
        })
      } else {
        const organizationId = params.organizationId as string
        await deleteOrganizationKycTeam({
          organizationId,
          kycTeamId: kycTeam?.id ?? "",
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "organization", organizationId],
        })
      }
    },
  })

  const openSelectKYCProjectDialog = () => {
    setData({
      kycTeamId: kycTeam?.id,
      alreadySelectedProjectIds: kycTeamProjects?.map(
        (team) => team.project.id,
      ),
    })
    setOpenDialog("select_kyc_project")
  }

  const onDeleteProjectKYCTeam = () => {
    if (!kycTeam?.id) return

    deleteProjectKYCTeam()
  }

  if (!kycTeam?.grantAddress) return null

  return (
    <div className="space-y-6">
      <div className="input-container space-x-1.5">
        <span className="text-sm text-foreground">
          {shortenAddress(kycTeam.grantAddress.address)}
        </span>
        <div className="px-2 py-1 bg-success text-success-foreground font-medium text-xs rounded-full flex space-x-1 items-center">
          <CheckIcon size={12} />
          <span>Valid until {kycTeam.grantAddress.validUntil}</span>
        </div>
      </div>
      {organizationProject && (
        <div className="space-y-2">
          <div className="w-full flex justify-between items-center">
            <span className="font-medium text-sm">
              {organizationProject ? "Projects" : "Project"}
            </span>
            <button
              className="flex items-center space-x-1"
              onClick={openSelectKYCProjectDialog}
            >
              <SquareCheck size={18} />
              <span>Choose</span>
              <ChevronRight size={14} />
            </button>
          </div>
          {Boolean(kycTeamProjects?.length) ? (
            <ul className="space-y-2 w-full">
              {kycTeamProjects?.map((team) => (
                <li
                  key={team.id}
                  className="input-container space-x-2 text-sm text"
                >
                  {team.project.thumbnailUrl && (
                    <Image
                      src={team.project.thumbnailUrl}
                      width={24}
                      height={24}
                      alt={team.project.name}
                    />
                  )}
                  <span className="text-sm font-normal">
                    {team.project.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm pt-2">
              No projects selected
            </div>
          )}
        </div>
      )}
      <Accordion
        type="single"
        triggerLocation="bottom"
        items={[
          {
            title: (
              <div className="font-medium text-secondary-foreground text-sm">
                Show Details
              </div>
            ),
            content: (
              <div className="space-y-6 mb-6">
                {Boolean(teamMembers?.length) && (
                  <div className="space-y-1.5">
                    <span className="font-medium text-sm text-foreground">
                      Verified persons
                    </span>
                    <ul className="space-y-1.5">
                      {teamMembers?.map((member) => (
                        <li key={member.id}>
                          <VerifiedTeamMemberContainer
                            name={`${member.firstName} ${member.lastName}`}
                            email={member.email}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Boolean(entities?.length) && (
                  <div className="space-y-1.5">
                    <span className="font-medium text-sm text-foreground">
                      Verified entities
                    </span>
                    <ul className="space-y-1.5">
                      {entities?.map((entity) => (
                        <li key={entity.id}>
                          <VerifiedEntityContainer
                            businessName={entity.businessName}
                            email={entity.email}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  variant="secondary"
                  disabled={isPending}
                  onClick={onDeleteProjectKYCTeam}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

function VerifiedTeamMemberContainer({
  name,
  email,
}: {
  name: string
  email: string
}) {
  return (
    <div className="input-container space-x-2">
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
        <User size={16} fill="#0F111A" />
      </div>
      <span className="font-medium text-sm">{name}</span>
      <span className="text-muted-foreground text-sm">{email}</span>
    </div>
  )
}

function VerifiedEntityContainer({
  businessName,
  email,
}: {
  businessName?: string | null
  email: string
}) {
  return (
    <div className="input-container space-x-2">
      {businessName && (
        <span className="font-medium text-sm">{businessName}</span>
      )}
      <span className="text-muted-foreground text-sm">{email}</span>
    </div>
  )
}
