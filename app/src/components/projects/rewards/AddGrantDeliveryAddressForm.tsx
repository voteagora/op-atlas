"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { toast } from "sonner"

import Accordion from "@/components/common/Accordion"
import { Button } from "@/components/common/Button"
import ExtendedLink from "@/components/common/ExtendedLink"
import { deleteOrganizationKYCTeam } from "@/lib/actions/organizations"
import { deleteProjectKYCTeamAction } from "@/lib/actions/projects"
import { KYCTeamWithTeam } from "@/lib/types"
import { cn, getValidUntil } from "@/lib/utils"
import { shortenAddress } from "@/lib/utils"
import { isKycTeamVerified } from "@/lib/utils/kyc"

import CompletedGrantDeliveryForm from "./CompletedGrantDeliveryForm"
import DeliveryAddressVerificationForm from "./DeliveryAddressVerificationForm"

export default function AddGrantDeliveryAddressForm({
  kycTeam,
}: {
  kycTeam?: KYCTeamWithTeam
}) {
  const { organizationId, projectId } = useParams()
  const queryClient = useQueryClient()

  const { mutate: deleteProjectKYCTeam } = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        await deleteProjectKYCTeamAction({
          kycTeamId: kycTeam?.id ?? "",
          projectId: projectId as string,
          hasActiveStream: !!(
            kycTeam?.rewardStreams && kycTeam.rewardStreams.length > 0
          ),
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "project", projectId],
        })
      } else {
        await deleteOrganizationKYCTeam({
          organizationId: organizationId as string,
          kycTeamId: kycTeam?.id ?? "",
          hasActiveStream: !!(
            kycTeam?.rewardStreams && kycTeam.rewardStreams.length > 0
          ),
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "organization", organizationId],
        })
      }
    },
  })

  const teamMembers = kycTeam?.team
    ?.filter((teamMember) => !Boolean(teamMember.users.businessName))
    .map((teamMember) => teamMember.users)
  const entities = kycTeam?.team
    ?.filter((teamMember) => Boolean(teamMember.users.businessName))
    .map((teamMember) => teamMember.users)
  const allTeamMembersVerified = isKycTeamVerified(kycTeam)

  const processCompleted =
    kycTeam?.walletAddress &&
    Boolean(Boolean(kycTeam?.team?.length) && allTeamMembersVerified)

  const openedAccordionValues = React.useMemo(() => {
    const values = new Set<string>()
    values.add("item-0")

    if (kycTeam?.team?.length) {
      values.add("item-1")
    }
    if (kycTeam?.team?.length && allTeamMembersVerified) {
      values.add("item-2")
    }

    // Convert to array and return
    return Array.from(values)
  }, [kycTeam, allTeamMembersVerified])

  const onDeleteProjectKYCTeam = () => {
    if (!kycTeam?.id) return

    deleteProjectKYCTeam()
  }

  return (
    <div className="p-6 border rounded-xl space-y-6 w-full">
      {!allTeamMembersVerified && (
        <h4 className="font-semibold text-base">Add an address</h4>
      )}
      {allTeamMembersVerified ? (
        <CompletedGrantDeliveryForm
          kycTeam={kycTeam}
          teamMembers={teamMembers}
          entities={entities}
        />
      ) : (
        <Accordion
          collapsible
          type="multiple"
          className="space-y-6"
          value={openedAccordionValues}
          items={[
            {
              title: (
                <AccordionTitleContainer
                  i={
                    kycTeam?.walletAddress ? (
                      <CheckIcon size={14} className="text-green-600" />
                    ) : (
                      1
                    )
                  }
                  text="Enter your grant delivery address"
                />
              ),
              content: kycTeam?.walletAddress ? (
                <>
                  <div className="input-container space-x-1.5">
                    <button
                      className="flex items-center space-x-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(kycTeam.walletAddress)
                        toast.success("Address copied to clipboard")
                      }}
                    >
                      <Image
                        src="/assets/chain-logos/optimism.svg"
                        width={16}
                        height={16}
                        alt="Optimism logo"
                        className="rounded-full"
                      />
                      <span className="text-sm text-foreground ">
                        {processCompleted
                          ? shortenAddress(kycTeam.walletAddress)
                          : kycTeam.walletAddress}
                      </span>
                    </button>
                    {processCompleted && (
                      <div className="px-2 py-1 bg-success text-success-foreground font-medium text-xs rounded-full flex space-x-1 items-center">
                        <CheckIcon size={12} />
                        <span>
                          Valid until {getValidUntil(kycTeam.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="mt-4"
                    variant="secondary"
                    onClick={onDeleteProjectKYCTeam}
                  >
                    Start over
                  </Button>
                </>
              ) : (
                <DeliveryAddressVerificationForm />
              ),
            },
            {
              title: (
                <AccordionTitleContainer
                  i={
                    Boolean(Boolean(kycTeam?.team?.length)) ? (
                      <CheckIcon size={14} className="text-green-600" />
                    ) : (
                      2
                    )
                  }
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
                      text={
                        Boolean(teamMembers?.length)
                          ? "Resubmit the form"
                          : "Fill out the form"
                      }
                      disabled={!Boolean(kycTeam?.walletAddress)}
                      href={`https://superchain.typeform.com/to/Pq0c7jYJ#l2_address=${kycTeam?.walletAddress}&kyc_team_id=${kycTeam?.id}`}
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
                        target="_blank"
                      >
                        kyc.optimism.io
                      </Link>{" "}
                      and businesses at{" "}
                      <Link
                        href="https://kyb.optimism.io"
                        className="underline hover:opacity-80"
                        target="_blank"
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

                  {Boolean(teamMembers?.length) && (
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
                  )}
                  {Boolean(entities?.length) && (
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
                  )}

                  {/* TODO: Update KYCTeam model to have submittedBy column */}
                  {/* <p className="text-muted-foreground text-sm font-normal">
                    Submitted by shaun@optimism.io
                  </p> */}
                  {kycTeam?.team?.length !== 0 && (
                    <p className="text-destructive text-sm font-normal">
                      We are checking for verifications. Please ensure every
                      person and business named in the grant eligibility form
                      has taken action and allow 48 hours before writing in.
                    </p>
                  )}
                  <div className="space-y-4">
                    <div className="text-sm text-secondary-foreground font-normal">
                      Is something missing or incorrect? You’ll need to{" "}
                      <Link
                        className="underline hover:opacity-80 transition-colors duration-300"
                        href={`https://superchain.typeform.com/to/Pq0c7jYJ#l2_address=${kycTeam?.walletAddress}&kyc_team_id=${kycTeam?.id}`}
                      >
                        cancel and start over
                      </Link>
                      .
                    </div>
                    <div className="flex space-x-2">
                      <ExtendedLink
                        as="button"
                        variant={
                          Boolean(kycTeam?.team?.length) ? "primary" : "default"
                        }
                        text="Verify my ID"
                        href="https://kyc.optimism.io/form"
                      />
                      <ExtendedLink
                        as="button"
                        variant={
                          Boolean(kycTeam?.team?.length) ? "primary" : "default"
                        }
                        text="Verify my Business ID"
                        href="https://kyb.optimism.io/form"
                      />
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}

function AccordionTitleContainer({
  i,
  text,
}: {
  i?: number | React.ReactNode
  text: string
}) {
  return (
    <div className="font-medium text-sm flex items-center space-x-2">
      {i && (
        <span className={cn([{ "w-3.5": typeof i === "number" }])}>{i}</span>
      )}
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
        <CheckIcon size={14} className="text-green-600" />
      ) : (
        <Loader2 size={14} className="animate-spin" />
      )}
      <span className="font-medium text-sm">{name}</span>
      <span className="text-muted-foreground text-sm">{email}</span>
    </div>
  )
}
