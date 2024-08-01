import Image from "next/image"
import Link from "next/link"
import React from "react"

import { UserOrganizationsWithDetails } from "@/lib/types"
import { isOrganizationSetupComplete } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

const UserOrganizationInfoRow = ({
  organization,
}: {
  organization: UserOrganizationsWithDetails
}) => {
  return (
    <div className="flex justify-between">
      <Link
        href={`/profile/organizations/${organization.organizationId}`}
        className="flex gap-2 justify-center items-center "
      >
        <h3 className="max-w-48 ml-1 text-xl font-semibold text-ellipsis overflow-hidden text-nowrap">
          {organization?.organization.name}
        </h3>
        <Badge variant="outline" className="h-[24px] shrink-0">
          {organization?.role}
        </Badge>
        <div className="h-full flex flex-row-reverse items-center w-fit ml-1.5">
          {organization?.organization?.team.slice(0, 5).map((teamUser) => (
            <Avatar key={teamUser.id} className="w-6 h-6 -ml-1.5 bg-secondary">
              <AvatarImage src={teamUser?.user?.imageUrl || ""} />
              <AvatarFallback>{teamUser?.user?.name}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        {!isOrganizationSetupComplete(organization.organization) && (
          <p className="text-sm font-medium text-secondary-foreground">
            Finish setting up your org
          </p>
        )}

        <Image
          src="/assets/icons/arrow-left.svg"
          height={7}
          width={5}
          alt="arrow"
        />
      </Link>
      <Link href={`/projects/new?orgId=${organization.organizationId}`}>
        <Button className="flex items-center gap-2" variant="secondary">
          <Image src="/assets/icons/plus.svg" width={9} height={9} alt="Plus" />
          Add project
        </Button>
      </Link>
    </div>
  )
}

export default UserOrganizationInfoRow
