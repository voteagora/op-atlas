"use client"

import { useQuery } from "@tanstack/react-query"
import { useFeatureFlagEnabled } from "posthog-js/react"
import React from "react"

import ExtendedLink from "@/components/common/ExtendedLink"
import { getKycTeamAction } from "@/lib/actions/projects"
import { ProjectTeam, ProjectWithFullDetails } from "@/lib/types"

import AddGrantDeliveryAddressForm from "./AddGrantDeliveryAddressForm"
import RewardAccordion from "./RewardAccordion"

export function RewardsSection({
  project,
  team,
}: {
  project: ProjectWithFullDetails & { organizationId?: string }
  team: ProjectTeam
}) {
  const isKycEnabled = useFeatureFlagEnabled("add-grant-delivery-address-form")

  const { data: kycTeam, isLoading } = useQuery({
    queryKey: ["kyc-teams", "project", project.id],
    queryFn: async () => {
      return await getKycTeamAction(project.id)
    },
    enabled: isKycEnabled,
  })
  const rewards = project.rewards.filter(
    (reward) => parseInt(reward.roundId) < 7, // Don't show Season 7 yet
  )

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col space-y-6">
        <h2>Rewards</h2>
        <div className="text-secondary-foreground">
          If this project receives any Retro Funding, we&apos;ll record it here.
        </div>
        {rewards.length ? (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <RewardAccordion team={team} reward={reward} key={reward.id} />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No grants yet
          </span>
        )}
      </div>
      {isKycEnabled && (
        <div className="flex flex-col space-y-6">
          <h2>Grant Delivery Address</h2>
          <p className="text-secondary-foreground">
            Add the address(es) your rewards will be delivered to. You can do
            this at any time, and your entry will be valid for one year.
          </p>
          <p className="text-secondary-foreground">
            KYC (identity verification) is required for each address.
          </p>
          {Boolean(project.organization) ? (
            <ExtendedLink
              as="button"
              href={`/profile/organizations/${project.organizationId}/grant-address`}
              text="Go to organization settings"
              variant="primary"
              target="_self"
            />
          ) : isLoading ? (
            <div className="p-6 border rounded-md space-y-6 w-full h-[356px]">
              <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
              <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 rounded-md h-[146px] w-full" />
                <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
                <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
              </div>
            </div>
          ) : (
            <AddGrantDeliveryAddressForm kycTeam={kycTeam} />
          )}
        </div>
      )}
    </div>
  )
}
