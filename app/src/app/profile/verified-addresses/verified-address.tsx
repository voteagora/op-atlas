import { CircleHelp, Copy, Ellipsis, X } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/common/Badge"
import { Badgeholder } from "@/components/common/Badgeholder"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBadgeholderAddress } from "@/lib/hooks"
import { UserAddressSource } from "@/lib/types"
import { shortenAddress } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { makeUserAddressPrimaryAction } from "./actions"

export const VerifiedAddress = ({
  address,
  source,
  primary,
  onCopy,
  onRemove,
  showCheckmark = true,
  shouldShortenAddress = false,
}: {
  address: string
  source: UserAddressSource
  primary: boolean
  onCopy: (address: string) => void
  onRemove?: (address: string) => void
  showCheckmark?: boolean
  shouldShortenAddress?: boolean
}) => {
  const { setOpenDialog } = useAppDialogs()
  const { isBadgeholderAddress } = useBadgeholderAddress(address)

  return (
    <div className="flex items-center gap-1.5 group">
      <div className="input-container justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {showCheckmark && (
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16.67}
              width={16.67}
              alt="Verified"
            />
          )}

          <p className="text-sm">
            {shouldShortenAddress ? shortenAddress(address) : address}
          </p>

          {primary && <Badge text="Primary address" className="shrink-0" />}
          {isBadgeholderAddress && <Badgeholder />}
          {source === "farcaster" && <Badge text="Farcaster" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-0 ring-0 transition-opacity opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
              <Ellipsis size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!primary && (
              <DropdownMenuItem>
                <button
                  className="w-full flex justify-start"
                  onClick={async () => makeUserAddressPrimaryAction(address)}
                >
                  Set as primary address
                </button>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <button
                className="flex space-x-1.5 justify-between w-full items-center"
                onClick={() => onCopy(address)}
              >
                <span>Copy address</span>
                <Copy size={16} />
              </button>
            </DropdownMenuItem>
            {source !== "farcaster" && onRemove && (
              <DropdownMenuItem>
                <button
                  className="flex space-x-1.5 justify-between w-full items-center"
                  onClick={() => onRemove(address)}
                >
                  <span>Remove</span>
                  <X size={16} />
                </button>
              </DropdownMenuItem>
            )}
            <hr className="border-t my-1.5" />
            <DropdownMenuItem>
              <button
                className="flex space-x-1.5 justify-between w-full"
                onClick={() => setOpenDialog("not_recognized_address")}
              >
                <span>I don&apos;t recognize this address</span>
                <CircleHelp fill="#000" className="text-white" size={16} />
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
