import { Organization } from "@prisma/client"
import Image from "next/image"

function ProfileOrganizations({ organizations }: { organizations: Organization[] }) {
  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium">Organizations</h2>
      <div className="flex flex-col gap-y-4">
        {organizations.map((organization) => (
          <div key={organization.id} className="flex items-center gap-x-3">
            {organization.avatarUrl ? (
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
            )}
            <span>{organization.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileOrganizations
