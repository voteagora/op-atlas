import { useMemo, useState } from "react"
import { type Address, checksumAddress, verifyMessage } from "viem"
import Image from "next/image"
import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const getMessage = (address: string) =>
  `I verify that I’m the owner of ${address} and I’m an optimist.`
export function VerifyAddressDialog({
  open,
  onOpenChange,
  deployerAddress,
  onSubmit,
}: DialogProps<{
  deployerAddress: Address
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
      const isValidSignature = await verifyMessage({
        address: deployerAddress,
        message: messageToSign,
        signature: signature as `0x${string}`,
      })

      if (isValidSignature) {
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
            <div className="flex flex-col items-center text-center gap-3">
              <Badge text="Verify contract" />
              <h3>
                Copy and sign the message below using your preferred provider
              </h3>
              <div className="text-text-secondary">
                Then, return here and continue to the next step.
              </div>
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <FormLabel>Message to sign</FormLabel>
              <Textarea disabled value={messageToSign} />
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
            <div className="flex flex-col items-center text-center gap-3">
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
