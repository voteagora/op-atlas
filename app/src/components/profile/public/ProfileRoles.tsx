import Image from "next/image"

import CheckIconRed from "@/components/icons/checkIconRed"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
        {attestations.map((attestation) => (
          <div
            key={attestation.id}
            className="rounded-lg border border-gray-200 p-6 w-[400px]"
          >
            <div className="text-lg font-medium flex items-center gap-2">
              {attestation.name} <CheckIconRed />
            </div>
            <div className="text-md text-gray-500">{attestation.subtext}</div>
            <a
              href={`https://optimism.easscan.org/attestation/view/${attestation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-600 mt-2 inline-flex items-center"
            >
              <span>Attestation</span>
              <Image
                src="/assets/icons/arrow-up-right.svg"
                width={10}
                height={10}
                alt="External link"
                className="ml-1"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileRoles
