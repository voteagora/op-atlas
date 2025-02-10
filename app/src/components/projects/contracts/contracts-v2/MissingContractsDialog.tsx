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
import { verifyContract, verifyDeployer } from "@/lib/actions/contracts"
import { Chain, getMessage } from "@/lib/utils/contracts"
import { ChainSelector } from "../contracts-v1/ChainSelector"
import { ChainSelector2 } from "./ChainSelector2"
import { Callout } from "@/components/common/Callout"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const defaultSelectedChain = 10

export function MissingContractsDialog({
  open,
  onOpenChange,
  projectId,
  deployerAddress,
}: // contractAddress,
// deploymentTxHash,
// chain,
// onSubmit,
DialogProps<{
  projectId: string
  deployerAddress: Address
  // contractAddress: Address
  // deploymentTxHash: `0x${string}`
  // chain?: Chain
  // onSubmit: (signature: string) => void
}>) {
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const messageToSign = useMemo(() => {
    const checksummedAddress = checksumAddress(deployerAddress)
    return getMessage(checksummedAddress)
  }, [deployerAddress])

  const onCopy = () => {
    navigator.clipboard.writeText(messageToSign)
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
      // onSubmit(signature)
    } catch (_) {
      setError("An error occurred, please try again")
    } finally {
      setLoading(false)
    }
  }

  async function onChainChange(value: string) {
    setSelectedChain(parseInt(value))
  }

  console.log(selectedChain)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        {page === 0 && (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <h3>Missing contracts</h3>

                <p className="text-secondary-foreground">
                  Common reasons why contracts may not appear under your
                  deployer address:
                </p>
              </div>
            </div>

            <button onClick={() => setPage(1)}>
              <Callout
                showIcon={false}
                type="gray"
                leftAlignedContent={
                  <p className="text-sm">
                    Contracts deployed within the last 24 hours—try manual
                    contract verification.
                  </p>
                }
                rightAlignedContent={
                  <div className="flex">
                    <ArrowRight width={20} height={20} />
                  </div>
                }
              />
            </button>

            <button
              //TODO:// Add link
              onClick={() => {}}
            >
              <Callout
                showIcon={false}
                type="gray"
                leftAlignedContent={
                  <p className="text-sm">
                    Contracts deployed via Create2, Optimism Bridge, or another
                    less common schema.
                  </p>
                }
                rightAlignedContent={
                  <div className="flex">
                    <p className="text-sm">Help</p>
                    <ArrowUpRight width={20} height={20} />
                  </div>
                }
              />
            </button>

            <button
              //TODO:// Add link
              onClick={() => {}}
            >
              <Callout
                showIcon={false}
                type="gray"
                leftAlignedContent={
                  <p className="text-sm">
                    Contracts deployed via a protocol like Zora, Sound.xyz,
                    Memecoin Launchpad, etc.
                  </p>
                }
                rightAlignedContent={
                  <div className="flex">
                    <p className="text-sm">Help</p>
                    <ArrowUpRight width={20} height={20} />
                  </div>
                }
              />
            </button>

            <Button
              className="self-stretch"
              variant="destructive"
              type="button"
              //TODO:// Add link
              onClick={() => {}}
            >
              Get help on Discord
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
