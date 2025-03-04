"use client"

import { KYCUser } from "@prisma/client"
import { CheckIcon, ChevronRight, Loader2, SquareCheck } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import Accordion from "@/components/common/Accordion"
import ExtendedLink from "@/components/common/ExtendedLink"
import { cn } from "@/lib/utils"
import { shortenAddress } from "@/lib/utils"

import CompletedGrantDeliveryForm from "./CompletedGrantDeliveryForm"
import DeliveryAddressVerificationForm from "./DeliveryAddressVerificationForm"

export default function AddGrantDeliveryAddressForm({
  kycTeam,
}: {
  kycTeam?: {
    id?: string
    grantAddress?: {
      address: string
      validUntil: string
    }
    projectId?: string
    team?: KYCUser[]
  }
}) {
  const params = useParams()
  const organizationProject = params.organizationId as string

  const teamMembers = kycTeam?.team?.filter(
    (teamMember) => !Boolean(teamMember.businessName),
  )
  const entities = kycTeam?.team?.filter((teamMember) =>
    Boolean(teamMember.businessName),
  )
  const allTeamMembersVerified =
    Boolean(kycTeam?.team?.length) &&
    kycTeam?.team?.every((teamMember) => teamMember.status === "APPROVED")

  return (
    <div className="p-6 border rounded-md space-y-6 w-full">
      {!allTeamMembersVerified && (
        <h4 className="font-semibold">Add an address</h4>
      )}
      {allTeamMembersVerified ? (
        <Accordion
          collapsible={false}
          type="single"
          items={[
            {
              title: <AccordionTitleContainer text="Grant delivery address" />,
              content: kycTeam?.grantAddress && (
                <CompletedGrantDeliveryForm
                  kycTeam={kycTeam}
                  organizationProject={Boolean(organizationProject)}
                  teamMembers={teamMembers}
                  entities={entities}
                />
              ),
            },
          ]}
        />
      ) : (
        <Accordion
          collapsible
          type="multiple"
          items={[
            {
              title: (
                <AccordionTitleContainer
                  i={
                    kycTeam?.grantAddress?.address ? (
                      <CheckIcon size={14} className="text-green-600" />
                    ) : (
                      1
                    )
                  }
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
                  organizationProject={Boolean(organizationProject)}
                />
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
                      disabled={!Boolean(kycTeam?.grantAddress?.address)}
                      href={
                        organizationProject
                          ? "https://kyb.optimism.io/form"
                          : "https://kyc.optimism.io/form"
                      }
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
                        href={`https://superchain.typeform.com/to/Pq0c7jYJ#l2_address=${kycTeam?.grantAddress?.address}&kyc_team_id=${kycTeam?.id}`}
                      >
                        cancel and start over
                      </Link>
                      .
                    </div>
                    <div className="flex space-x-2">
                      <ExtendedLink
                        as="button"
                        variant="primary"
                        text="Verify my ID"
                        href="https://kyc.optimism.io/form"
                        disabled={!Boolean(entities?.length)}
                      />
                      <ExtendedLink
                        as="button"
                        variant="primary"
                        text="Verify my Business ID"
                        href="https://kyb.optimism.io/form"
                        disabled={!Boolean(entities?.length)}
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
