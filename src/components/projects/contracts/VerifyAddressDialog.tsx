import Image from "next/image"
import { useMemo, useState } from "react"
import { type Address, checksumAddress } from "viem"

import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { verifyContract } from "@/lib/actions/contracts"
import { Chain, getMessage } from "@/lib/contractUtils"

export function VerifyAddressDialog({
  open,
  onOpenChange,
  projectId,
  deployerAddress,
  contractAddress,
  deploymentTxHash,
  chain,
  onSubmit,
}: DialogProps<{
  projectId: string
  deployerAddress: Address
  contractAddress: Address
  deploymentTxHash: `0x${string}`
  chain: Chain
  onSubmit: (signature: string) => void
}>) {
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [error, setError] = useState(false)

  const messageToSign = useMemo(() => {
    const checksummedAddress = checksumAddress(deployerAddress)
    return getMessage(checksummedAddress)
  }, [deployerAddress])

  const onCopy = () => {
    navigator.clipboard.writeText(messageToSign)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onConfirmSignature = async () => {
    try {
      const verificationResult = await verifyContract({
        projectId,
        contractAddress,
        deployerAddress,
        deploymentTxHash,
        signature: signature as `0x${string}`,
        chain,
      })

      if (!verificationResult.error) {
        onSubmit(signature)
        return
      } else {
        setError(true)
      }
    } catch (_) {
      setError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        {page === 0 && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <Badge text="Verify contract" />
              <div className="flex flex-col items-center gap-1">
                <h3>
                  Copy and sign the message below using your preferred provider
                </h3>
                <p className="text-secondary-foreground">
                  Then, return here and continue to the next step.
                  <br />
                  You can{" "}
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
              <FormLabel>Message to sign</FormLabel>
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
              <Badge text="Verify contract" />
              <h3>
                Enter the resulting signature hash from your signed message
              </h3>
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <FormLabel>Signature hash</FormLabel>
              <Textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="resize-none"
              />
              {error && (
                <div className="text-destructive text-sm font-medium">
                  Invalid signature
                </div>
              )}
            </div>
            <Button
              className="self-stretch"
              variant="destructive"
              type="button"
              disabled={!signature}
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
