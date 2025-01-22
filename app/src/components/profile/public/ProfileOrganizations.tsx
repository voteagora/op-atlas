import { Organization } from "@prisma/client"
import Image from "next/image"

import ExtendedLink from "@/components/common/ExtendedLink"

function ProfileOrganizations({
  organizations,
}: {
  organizations: Organization[]
}) {
  if (organizations.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-medium">Organizations</h2>
      <div className="flex flex-col space-y-4">
        {organizations.map((organization) => (
          <ExtendedLink
            href={`/${organization.id}`}
            key={organization.id}
            text={organization.name}
            icon={
              organization.avatarUrl ? (
                <Image
                  src={organization.avatarUrl ?? ""}
                  alt={organization.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span>{organization.name.charAt(0)}</span>
                </div>
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

export default ProfileOrganizations
