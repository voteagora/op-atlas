import { CircleHelp, Copy, Ellipsis, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getAddress, isAddress } from "viem"

import { Badge } from "@/components/common/Badge"
import { Badgeholder } from "@/components/common/Badgeholder"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/hooks/db/useUser"
import { useBadgeholderAddress } from "@/lib/hooks"
import { UserAddressSource } from "@/lib/types"
import { shortenAddress } from "@/lib/utils"
import { getSafeAddressVerificationMessage } from "@/lib/utils/safeAddresses"
import { useAppDialogs } from "@/providers/DialogProvider"

import {
  makeUserAddressPrimaryAction,
  verifySafeAddressAction,
} from "./actions"
import { AddressData } from "./content"

export const VerifiedAddress = ({
  address,
  source,
  primary,
  onRemove,
  showCheckmark = true,
  shouldShortenAddress = false,
  userId,
}: {
  address: string
  source: UserAddressSource
  primary: boolean
  onRemove?: (address: string) => void
  showCheckmark?: boolean
  shouldShortenAddress?: boolean
  userId: string
}) => {
  const { setOpenDialog } = useAppDialogs()
  const { isBadgeholderAddress } = useBadgeholderAddress(address)
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })

  const onCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

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

          {primary && <Badge text="Governance" className="bg-secondary text-secondary-foreground px-2 py-1 shrink-0" />}
          {isBadgeholderAddress && <Badgeholder />}
          {source === "farcaster" && <Badge text="Farcaster" className="bg-secondary text-secondary-foreground px-2 py-1" />}
          {source === "privy" && <Badge text="Privy" className="bg-secondary text-secondary-foreground px-2 py-1" />}
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
                  onClick={() => onSetPrimary(address)}
                >
                  Set as governance address
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
            {onRemove && (
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

export const SafeAddressRow = ({
  address,
  onRemove,
  shouldShortenAddress = false,
}: {
  address: string
  onRemove?: (address: string) => void
  shouldShortenAddress?: boolean
}) => {
  const displayAddress = shouldShortenAddress
    ? shortenAddress(address)
    : address

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <div className="input-container justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <Image
            src="/assets/icons/circle-check-green.svg"
            height={16.67}
            width={16.67}
            alt="Verified Safe"
          />

          <p className="text-sm">{displayAddress}</p>

          <Badge text="Safe" className="bg-secondary text-secondary-foreground px-2 py-1 shrink-0" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-0 ring-0 transition-opacity opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
              <Ellipsis size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <button
                className="flex space-x-1.5 justify-between w-full items-center"
                onClick={handleCopy}
              >
                <span>Copy address</span>
                <Copy size={16} />
              </button>
            </DropdownMenuItem>
            {onRemove && (
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function VerifySafeAddressDialog({
  open,
  onOpenChange,
  onVerified,
  allAddresses,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: (safeAddress: string) => void
  allAddresses: Map<string, AddressData>
}) {
  const blockExplorerBaseUrl = "https://optimistic.etherscan.io"
  const [page, setPage] = useState(0)
  const [safeAddressInput, setSafeAddressInput] = useState("")
  const [safeAddress, setSafeAddress] = useState<`0x${string}` | null>(null)
  const [signature, setSignature] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const message = useMemo(
    () => (safeAddress ? getSafeAddressVerificationMessage(safeAddress) : ""),
    [safeAddress],
  )

  useEffect(() => {
    if (!open) {
      setPage(0)
      setSafeAddressInput("")
      setSafeAddress(null)
      setSignature("")
      setCopied(false)
      setError(null)
      setLoading(false)
    }
  }, [open])

  const handleSafeAddressChange = (value: string) => {
    setSafeAddressInput(value)
    setError(null)
    setCopied(false)
    setSignature("")

    if (!value) {
      setSafeAddress(null)
      return
    }

    if (!isAddress(value)) {
      setSafeAddress(null)
      return
    }

    try {
      setSafeAddress(getAddress(value) as `0x${string}`)
    } catch (_) {
      setSafeAddress(null)
    }
  }

  const handleCopy = () => {
    if (!safeAddress || !message) return
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBack = () => {
    setPage(0)
    setSignature("")
    setError(null)
  }

  const handleContinue = () => {
    if (!safeAddress) {
      setError("Enter a valid Safe address")
      return
    }

    setError(null)
    setPage(1)
  }

  const handleVerify = () => {
    if (!safeAddress) {
      setPage(0)
      setError("Enter a valid Safe address")
      return
    }

    const normalizedSignature = signature.trim()

    if (!normalizedSignature) {
      setError("Signature is required")
      return
    }

    setLoading(true)

    const verifyPromise = verifySafeAddressAction({
      safeAddress,
      signature: normalizedSignature,
      allAddresses: Array.from(allAddresses.values()),
    }).then((res) => {
      if (res.error) {
        setError(res.error)
        throw new Error(res.error)
      }

      setError(null)
      onVerified(res.safeAddress ?? safeAddress)
      onOpenChange(false)
      return res
    })

    toast.promise(verifyPromise, {
      loading: "Verifying Safe address...",
      success: "Safe address added",
      error: (err) => err.message ?? "Failed to verify Safe address",
    })

    verifyPromise.finally(() => setLoading(false))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        {page === 0 && (
          <>
            <DialogHeader className="items-center gap-4 text-center">
              <Badge text="Safe address" className="bg-secondary text-secondary-foreground px-2 py-1" />
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3>
                    Copy and sign the message below using your preferred
                    provider
                  </h3>
                  <p className="text-secondary-foreground">
                    Then, return here and continue to the next step.
                    <br />
                    You can{" "}
                    <ExternalLink
                      href={`${blockExplorerBaseUrl}/verifiedSignatures`}
                      className="underline"
                    >
                      use Etherscan
                    </ExternalLink>{" "}
                    to generate a signature.
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col self-stretch gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="safe-address-input">Safe address</Label>
                <Input
                  id="safe-address-input"
                  placeholder="0x..."
                  value={safeAddressInput}
                  onChange={(event) =>
                    handleSafeAddressChange(event.target.value)
                  }
                  autoComplete="off"
                />
                {safeAddressInput && !safeAddress && (
                  <p className="text-xs font-medium text-destructive">
                    Enter a valid Safe address
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="safe-address-message">Message to sign</Label>
                <Textarea
                  id="safe-address-message"
                  disabled
                  value={
                    safeAddress
                      ? message
                      : "Enter a Safe address to generate the message"
                  }
                  className="resize-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!safeAddress}
                  onClick={handleCopy}
                  className="mt-2"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  className="self-stretch button-primary"
                  disabled={!safeAddress}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}
          </>
        )}

        {page === 1 && safeAddress && (
          <>
            <Button
              variant="ghost"
              type="button"
              className="p-1 absolute left-[12px] top-[12px]"
              onClick={handleBack}
            >
              <Image
                src="/assets/icons/arrowLeftIcon.svg"
                width={13}
                height={12}
                alt="Back"
              />
            </Button>

            <DialogHeader className="items-center gap-2 text-center">
              <Badge text="Safe address" className="bg-secondary text-secondary-foreground px-2 py-1" />
              <DialogTitle>Confirm your signature</DialogTitle>
              <DialogDescription>
                Paste the signature produced by one of the Safe owners signing
                the message above.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col self-stretch gap-1">
              <Label htmlFor="safe-address-signature">Signature hash</Label>
              <Textarea
                id="safe-address-signature"
                value={signature}
                onChange={(event) => setSignature(event.target.value)}
                className="resize-none"
              />
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}
            </div>

            <Button
              className="self-stretch disabled:bg-destructive/80 disabled:text-white"
              variant="destructive"
              type="button"
              disabled={!signature || loading}
              onClick={handleVerify}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Add Safe address"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
