"use client"

import { KYCUser } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { CheckIcon, ChevronRight, Loader2, SquareCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import Accordion from "@/components/common/Accordion"
import ExtendedLink from "@/components/common/ExtendedLink"
import { getProjectKYCTeamsAction } from "@/lib/actions/projects"
import { shortenAddress } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import DeliveryAddressVerificationForm from "./DeliveryAddressVerificationForm"

export default function AddGrantDeliveryAddressForm({
  userInOrganization,
  kycTeam,
}: {
  userInOrganization: boolean
  kycTeam?: {
    id?: string
    grantAddress?: {
      address: string
      validUntil: string
    }
    team?: KYCUser[]
  }
}) {
  const { setData, setOpenDialog } = useAppDialogs()
  const { data: kycTeamProjects } = useQuery({
    queryKey: ["kycTeamProjects", kycTeam?.id],
    queryFn: async () => {
      if (!kycTeam?.id) return []

      return getProjectKYCTeamsAction(kycTeam.id)
    },
  })

  const teamMembers = kycTeam?.team?.filter(
    (teamMember) => !Boolean(teamMember.businessName),
  )
  const entities = kycTeam?.team?.filter((teamMember) =>
    Boolean(teamMember.businessName),
  )
  const allTeamMembersVerified = teamMembers?.every(
    (teamMember) => teamMember.status === "APPROVED",
  )

  const openSelectKYCProjectDialog = () => {
    setData({
      kycTeamId: kycTeam?.id,
      alreadySelectedProjectIds: kycTeamProjects?.map(
        (team) => team.project.id,
      ),
    })
    setOpenDialog("select_kyc_project")
  }

  return (
    <div className="p-6 border rounded-md space-y-6 w-full">
      {!allTeamMembersVerified && (
        <h4 className="font-semibold">Add an address</h4>
      )}
      {allTeamMembersVerified ? (
        <Accordion
          type="single"
          items={[
            {
              title: (
                <AccordionTitleContainer i={1} text="Grant delivery address" />
              ),
              content: kycTeam?.grantAddress && (
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
                  <div className="space-y-2">
                    <div className="w-full flex justify-between items-center">
                      <span className="font-medium text-sm">Projects</span>
                      <button
                        className="flex items-center space-x-1"
                        onClick={openSelectKYCProjectDialog}
                      >
                        <SquareCheck size={18} />
                        <span>Choose</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
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
                  </div>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <Accordion
          type="multiple"
          items={[
            {
              title: (
                <AccordionTitleContainer
                  i={1}
                  text="Enter your grant delivery address"
                />
              ),
              content: kycTeam?.grantAddress ? (
                <div className="input-container space-x-1.5">
                  <span className="text-sm text-foreground">
                    {shortenAddress(kycTeam.grantAddress.address)}
                  </span>
                  <div className="px-2 py-1 bg-success text-success-foreground font-medium text-xs rounded-full flex space-x-1 items-center">
                    <CheckIcon size={12} />
                    <span>Valid until {kycTeam.grantAddress.validUntil}</span>
                  </div>
                </div>
              ) : (
                <DeliveryAddressVerificationForm
                  userInOrganization={userInOrganization}
                />
              ),
            },
            {
              title: (
                <AccordionTitleContainer
                  i={2}
                  text="Submit the grant eligibility form"
                />
              ),
              content: (
                <div className="space-y-4">
                  <p className="text-secondary-foreground text-sm font-normal">
                    After submitting the form, your status will be updated
                    (within 1 hour).
                  </p>
                  <div>
                    <ExtendedLink
                      as="button"
                      variant="primary"
                      text={"Fill out the form"}
                      disabled={!Boolean(kycTeam?.grantAddress?.address)}
                      href={
                        userInOrganization
                          ? "https://kyb.optimism.io/form"
                          : "https://kyc.optimism.io/form"
                      }
                      showOutboundLinkIcon={false}
                    />
                  </div>
                </div>
              ),
            },
            {
              title: <AccordionTitleContainer i={3} text="Complete KYC" />,
              content: (
                <div className="space-y-4">
                  <div className="text-secondary-foreground space-y-4">
                    <p className="text-sm font-normal">
                      Each person or business identified in the grant
                      eligibility form must verify their identity—individuals at{" "}
                      <Link
                        href="https://kyc.optimism.io"
                        className="underline hover:opacity-80"
                      >
                        kyc.optimism.io
                      </Link>{" "}
                      and businesses at{" "}
                      <Link
                        href="https://kyb.optimism.io"
                        className="underline hover:opacity-80"
                      >
                        kyb.optimism.io
                      </Link>
                      .
                    </p>
                    <p className="text-sm font-normal">
                      If a person or business has been verified within the last
                      calendar year, they do not need to verify again.
                    </p>
                    <p className="text-sm font-normal">
                      After completing KYC or KYB, your status will be updated
                      (within 48 hours).{" "}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-medium text-sm">Persons</span>
                    {teamMembers?.map((teamMember, i) => (
                      <KYCEntryContainer
                        key={teamMember.id}
                        name={`${teamMember.firstName} ${teamMember.lastName}`}
                        email={teamMember.email}
                        verified={teamMember.status === "APPROVED"}
                      />
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-medium text-sm">Entities</span>
                    {entities?.map((entity) => (
                      <KYCEntryContainer
                        key={entity.id}
                        name={entity.businessName ?? "No name"}
                        email={entity.email}
                        verified={entity.status === "APPROVED"}
                      />
                    ))}
                  </div>

                  {/* TODO: Update KYCTeam model to have submittedBy column */}
                  {/* <p className="text-muted-foreground text-sm font-normal">
                    Submitted by shaun@optimism.io
                  </p> */}
                  {kycTeam?.team?.length === 0 && (
                    <p className="text-destructive text-sm font-normal">
                      We are checking for verifications. Please ensure every
                      person and business named in the grant eligibility form
                      has taken action and allow 48 hours before writing in.
                    </p>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}

function AccordionTitleContainer({ i, text }: { i: number; text: string }) {
  return (
    <div className="font-medium text-sm flex items-center space-x-2">
      <span>{i}</span>
      <span>{text}</span>
    </div>
  )
}

function KYCEntryContainer({
  name,
  email,
  verified = false,
}: {
  name: string
  email: string
  verified: boolean
}) {
  return (
    <div className="input-container space-x-2">
      {verified ? (
        <CheckIcon size={18} />
      ) : (
        <Loader2 size={18} className="animate-spin" />
      )}
      <span className="font-medium text-sm">{name}</span>
      <span className="text-muted-foreground text-sm">{email}</span>
    </div>
  )
}
