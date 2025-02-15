import { ProjectContract } from "@prisma/client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { type Address } from "viem"

import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { verifyDeployer } from "@/lib/actions/contracts"
import { getMessage } from "@/lib/utils/contracts"

import { ChainSelector } from "./ChainSelector"

const defaultSelectedChain = 10

export function VerifyAddressDialog({
  open,
  onOpenChange,
  projectId,
  deployerAddress,
  onSubmit,
}: DialogProps<{
  projectId: string
  deployerAddress: Address
  onSubmit: (
    includedContracts: ProjectContract[],
    excludedContracts: ProjectContract[],
    signature: string,
    verificationChainId: string,
  ) => void
}>) {
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const onCopy = () => {
    navigator.clipboard.writeText(getMessage(projectId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [selectedChain, setSelectedChain] =
    useState<number>(defaultSelectedChain)

  const onConfirmSignature = async () => {
    try {
      setLoading(true)

      const verificationResult = await verifyDeployer(
        projectId,
        deployerAddress,
        selectedChain!,
        signature as `0x${string}`,
      )

      if (verificationResult.error !== null) {
        setError(verificationResult.error)
        return
      }

      setError(undefined)
      onSubmit(
        verificationResult.contracts.included as ProjectContract[],
        verificationResult.contracts.excluded as ProjectContract[],
        signature,
        selectedChain.toString(),
      )
    } catch (_) {
      setError("An error occurred, please try again")
    } finally {
      setLoading(false)
    }
  }

  async function onChainChange(value: string) {
    setSelectedChain(parseInt(value))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        {page === 0 && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <Badge text="Verify deployer" />
              <div className="flex flex-col items-center gap-1">
                <h3>
                  Copy and sign the message below using your preferred provider
                </h3>
                <p className="text-secondary-foreground">
                  Then, return here and continue to the next step.
                  <br />
                  You can{" "}
                  <ExternalLink
                    href="https://optimistic.etherscan.io/verifiedSignatures"
                    className="underline"
                  >
                    use Etherscan
                  </ExternalLink>{" "}
                  to generate a signature.
                </p>
              </div>
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <ChainSelector
                defaultValue={defaultSelectedChain.toString()}
                onChange={onChainChange}
              />
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <FormLabel>Message to sign</FormLabel>
              <Textarea
                disabled
                value={getMessage(projectId)}
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
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}
            </div>
            <Button
              className="self-stretch disabled:bg-destructive/80 disabled:text-white"
              variant="destructive"
              type="button"
              disabled={!signature || loading}
              onClick={onConfirmSignature}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
