import useAttestations from "@/hooks/api/useAttestations"
import { UserWithAddresses } from "@/lib/types"

function ProfileRoles({ user }: { user: UserWithAddresses }) {
  const { merged: attestations } = useAttestations(
    user.addresses.map((a) => a.address),
  )

  if (!attestations || attestations.length === 0) return null

  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium">Roles</h2>
      <div className="flex flex-col gap-y-4">
        {attestations.map((attestation) => (
          <div key={attestation.id}>
            <div className="text-sm font-medium">{attestation.name}</div>
            <div className="text-sm text-gray-500">{attestation.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileRoles
