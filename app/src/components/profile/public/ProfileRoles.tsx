import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import CheckIconRed from "@/components/icons/checkIconRed"
import useAttestations from "@/hooks/api/useAttestations"
import { UserWithAddresses } from "@/lib/types"

function ProfileRoles({ user }: { user: UserWithAddresses }) {
  const { raw: attestations } = useAttestations(
    user.addresses.map((a) => a.address),
  )

  if (!attestations || attestations.length === 0) return null

  return (
    <div className="flex flex-col gap-y-4 mt-12 w-full">
      <h2 className="text-xl font-medium">Roles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-4 justify-between">
        {attestations.map((attestation) => (
          <div
            key={attestation.id}
            className="rounded-xl border border-gray-200 p-6 bg-background"
          >
            <div className="text-md font-medium flex items-center gap-2">
              {attestation.name} <CheckIconRed />
            </div>
            <div className="text-md text-secondary-foreground">
              {attestation.subtext}
            </div>
            <OutboundArrowLink
              text="Attestation"
              target={`https://optimism.easscan.org/attestation/view/${attestation.id}`}
              className="text-sm text-secondary-foreground hover:text-gray-600 mt-2 inline-flex items-center"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileRoles
