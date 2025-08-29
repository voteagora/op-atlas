import { Organization } from "@prisma/client"
import Image from "next/image"

import ProfileSidebarLink from "./ProfileSidebarLink"

function ProfileOrganizations({
  organizations,
}: {
  organizations: Organization[]
}) {

  if (organizations.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col pt-6">
      <h2 className="text-foreground text-sm font-medium leading-tight pl-3 pb-3">
        Organizations
      </h2>
      {organizations.map((organization) => (
        <ProfileSidebarLink
          href={`/${organization.id}`}
          key={organization.id}
          text={organization.name}
          icon={
            organization.avatarUrl ? (
              <Image
                src={organization.avatarUrl ?? ""}
                alt={organization.name}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[20px] h-[20px] rounded-full bg-gray-200 flex items-center justify-center text-sm">
                <span>{organization.name.charAt(0)}</span>
              </div>
            )
          }
        />
      ))}
    </div>
  )
}

export default ProfileOrganizations
