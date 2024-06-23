import Image from "next/image"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import { isAddress } from "viem"

import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { Input } from "../ui/input"

export function AddVerifiedAddressDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [address, setAddress] = useState<string>()

  const { data: session } = useSession()

  const messageToSign = useMemo(() => {
    return `I verify that I am ${session?.user.farcasterId} on Farcaster and I'm an optimist.`
  }, [session?.user.farcasterId])

  const onCopy = () => {
    navigator.clipboard.writeText(messageToSign)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onConfirmSignature = async () => {
    try {
      setLoading(true)
    } catch (_) {
      setError("An error occurred, please try again")
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        {page === 0 && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <Badge text="Verify address" />
              <div className="flex flex-col items-center gap-1">
                <h3>Copy and sign the message below</h3>
                <p className="text-secondary-foreground">
                  Be sure to sign using the desired address, then return here
                  and continue to the next step. You can{" "}
                  <ExternalLink
                    href="https://etherscan.io/verifiedSignatures"
                    className="underline"
                  >
                    use Etherscan
                  </ExternalLink>{" "}
                  to generate a signature.
                </p>
              </div>
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <div className="text-sm font-medium">Enter an address</div>
              <Input
                value={address ?? ""}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="text-secondary-foreground text-sm"
              />
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <div className="text-sm font-medium">Message to sign</div>
              <Textarea
                disabled
                value={messageToSign}
                className="resize-none"
              />
              <Button type="button" onClick={onCopy} variant="secondary">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Button
              className="self-stretch"
              variant="destructive"
              type="button"
              disabled={!address || !isAddress(address)}
              onClick={() => setPage(1)}
            >
              Continue
            </Button>
          </>
        )}
        {page === 1 && (
          <>
            <Button
              variant="ghost"
              type="button"
              className="p-1 absolute left-[12px] top-[12px]"
              onClick={() => setPage(0)}
            >
              <Image
                src="/assets/icons/arrowLeftIcon.svg"
                width={13}
                height={12}
                alt="Back"
              />
            </Button>
            <div className="flex flex-col items-center text-center gap-4">
              <Badge text="Verify address" />
              <h3>
                Enter the resulting signature hash from your signed message
              </h3>
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <div>Signature hash</div>
              <Textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="resize-none"
              />
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}
            </div>
            <Button
              className="self-stretch"
              variant="destructive"
              type="button"
              disabled={!signature || loading}
              onClick={onConfirmSignature}
            >
              Continue
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
