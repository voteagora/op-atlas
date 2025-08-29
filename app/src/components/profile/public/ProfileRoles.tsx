import { useState } from "react"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import CheckIconRed from "@/components/icons/checkIconRed"
import { ArrowDownS } from "@/components/icons/remix"
import useAttestations from "@/hooks/api/useAttestations"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

function ProfileRoles({ user }: { user: UserWithAddresses }) {
  const [showAll, setShowAll] = useState(false)
  const { raw: attestations } = useAttestations(
    user?.addresses?.map((a) => a.address),
  )

  const filteredAttestations = attestations?.filter(
    (attestation) => attestation.entity !== "votes",
  )

  if (!filteredAttestations || filteredAttestations.length === 0) return null

  const visibleAttestations = showAll
    ? filteredAttestations
    : filteredAttestations.slice(0, 7)
  const hasMore = filteredAttestations.length > 7

  if (!visibleAttestations || visibleAttestations.length === 0) return null

  return (
    <div className="flex flex-col space-y-3 w-full">
      <h2 className="text-xl font-medium">Roles</h2>
      <div className="grid grid-cols-1 gap-3 justify-between">
        {visibleAttestations.map((attestation) => (
          <div
            key={attestation.id}
            className="rounded-xl border border-gray-200 p-4 bg-background group/card flex flex-row gap-x-1.5 items-center justify-between hover:bg-[#F2F3F8] hover:cursor-pointer"
          >
            <div className="text-md font-medium flex gap-x-1.5 items-center">
              <div className="mr-0.5">
                <CheckIconRed />
              </div>
              <span className="group-hover/card:underline">
                {attestation.name}
              </span>{" "}
              <span className="relative group pt-1">
                {attestation.isFoundationAttestation && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-background px-2 py-1 text-xs text-secondary-foreground font-light shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                    Attested by Optimism Foundation
                  </span>
                )}
              </span>
              <div className="text-secondary-foreground font-normal">
                {attestation.subtext}
              </div>
            </div>
            <div className="inline-flex gap-x-2 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 ">
              <OutboundArrowLink
                text="About"
                target={`https://gov.optimism.io/t/optimism-governance-glossary/9407`}
                className="text-secondary-foreground hover:text-gray-600 inline-flex items-center"
              />
              <OutboundArrowLink
                text="Attestation"
                target={`https://optimism.easscan.org/attestation/view/${attestation.id}`}
                className="text-secondary-foreground hover:text-gray-600 inline-flex items-center"
              />
            </div>
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm hover:underline text-left pt-3 "
          >
            {showAll
              ? `Hide ${filteredAttestations.length - 7} more`
              : `Show ${filteredAttestations.length - 7} more`}
            <ArrowDownS
              className={cn(
                "w-4 h-4 ml-1 transition-transform duration-300 inline-block",
                showAll && "rotate-180",
              )}
            />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileRoles
