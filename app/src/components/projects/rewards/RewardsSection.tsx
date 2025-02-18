"use client"

import { Organization } from "@prisma/client"
import React from "react"

import ExtendedLink from "@/components/common/ExtendedLink"
import { ProjectWithDetails } from "@/lib/types"

import AddGrantDeliveryAddressForm from "./AddGrantDeliveryAddressForm"
import RewardAccordion from "./RewardAccordion"

export function RewardsSection({
  project,
  userOrganizations,
}: {
  project: ProjectWithDetails
  userOrganizations: Organization[]
}) {
  const rewards = project.rewards
  const userInOrganization = React.useMemo(() => {
    return userOrganizations.length > 0
  }, [userOrganizations])
  const organizationUrl = React.useMemo(() => {
    if (!userInOrganization) {
      return "/profile/organizations/new"
    }

    return `/profile/organizations/${userOrganizations[0].id}`
  }, [userOrganizations, userInOrganization])

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
              <RewardAccordion
                team={project.team}
                reward={reward}
                key={reward.id}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No grants yet
          </span>
        )}
      </div>
      <div className="flex flex-col space-y-6">
        <h2>Grant Delivery Address</h2>
        <p className="text-secondary-foreground">
          Add the address(es) your rewards will be delivered to. You can do this
          at any time, and your entry will be valid for one year.
        </p>
        <p className="text-secondary-foreground">
          KYC (identity verification) is required for each address.
        </p>
        {userInOrganization ? (
          <ExtendedLink
            as="button"
            href={organizationUrl}
            text="Go to organization settings"
            variant="primary"
          />
        ) : (
          <AddGrantDeliveryAddressForm
            userInOrganization={userInOrganization}
          />
        )}
      </div>
    </div>
  )
}
