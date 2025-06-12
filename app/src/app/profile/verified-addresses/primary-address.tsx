import Image from "next/image"
import { toast } from "sonner"
import { getAddress } from "viem"

import { Badge } from "@/components/common/Badge"
import { Badgeholder } from "@/components/common/Badgeholder"
import { useUser } from "@/hooks/db/useUser"
import { useBadgeholderAddress } from "@/lib/hooks"
import { UserAddressSource } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"

import { makeUserAddressPrimaryAction } from "./actions"

export const PrimaryAddress = ({
  address,
  source,
  primary,
  showCheckmark = true,
  userId,
  truncateAddress: shouldTruncate = false,
}: {
  address: string
  source: UserAddressSource
  primary: boolean
  showCheckmark?: boolean
  userId: string
  truncateAddress?: boolean
}) => {
  const { isBadgeholderAddress } = useBadgeholderAddress(address)
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })

  const displayAddress = shouldTruncate ? truncateAddress(address) : address

  const onSetPrimary = (address: string) => {
    toast.promise(
      makeUserAddressPrimaryAction(getAddress(address)).then(() => {
        invalidateUser()
      }),
      {
        loading: "Setting governance address...",
        success: "Governance address set",
        error: "Failed to set governance address",
      },
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="input-container justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <input
            type="radio"
            checked={primary}
            onChange={() => onSetPrimary(address)}
            className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
            style={{
              backgroundColor: primary ? "black" : "white",
              borderColor: "black",
            }}
          />
          {showCheckmark && (
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16.67}
              width={16.67}
              alt="Verified"
            />
          )}

          <p className="text-sm">{displayAddress}</p>

          {primary && <Badge text="Governance" className="shrink-0" />}
          {isBadgeholderAddress && <Badgeholder />}
          {source === "farcaster" && <Badge text="Farcaster" />}
          {source === "privy" && <Badge text="Privy" />}
        </div>
      </div>
    </div>
  )
}
