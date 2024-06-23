import { Copy } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/common/Badge"
import { Badgeholder } from "@/components/common/Badgeholder"
import { Button } from "@/components/ui/button"
import { UserAddressSource } from "@/lib/types"
import { cn } from "@/lib/utils"

export const VerifiedAddress = ({
  className,
  address,
  source,
  isBadgeholder = false,
  onCopy,
  onRemove,
}: {
  className?: string
  address: string
  source: UserAddressSource
  isBadgeholder?: boolean
  onCopy: (address: string) => void
  onRemove: (address: string) => void
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
          className,
        )}
      >
        <Image
          src="/assets/icons/circle-check-green.svg"
          height={16.67}
          width={16.67}
          alt="Verified"
        />

        <p className="text-sm">{address}</p>

        <Button
          variant="ghost"
          className="h-4 w-fit p-0"
          onClick={() => onCopy(address)}
        >
          <Copy size={16} />
        </Button>

        {isBadgeholder && <Badgeholder />}
        {source === "farcaster" && <Badge text="Farcaster" />}
      </div>
      {source !== "farcaster" && (
        <Button variant="secondary" onClick={() => onRemove(address)}>
          Remove
        </Button>
      )}
    </div>
  )
}
