import Image from "next/image"
import { useMemo, useState } from "react"
import { type Address, checksumAddress, isAddress, isHex } from "viem"

import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { verifyContract, verifyDeployer } from "@/lib/actions/contracts"
import { Chain, getMessage } from "@/lib/utils/contracts"
import { ChainSelector } from "../contracts-v1/ChainSelector"
import { ChainSelector2 } from "./ChainSelector2"
import { Callout } from "@/components/common/Callout"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const defaultSelectedChain = 10

export function MissingContractsDialog({
  defaultPage,
  open,
  onOpenChange,
  projectId,
  deployerAddress,
  signature,
  onSubmit,
}: DialogProps<{
  defaultPage: number
  projectId: string
  deployerAddress: Address
  signature: string
  onSubmit: (contract: { address: string; chainId: string }) => void
}>) {
  const [page, setPage] = useState(defaultPage)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const [selectedChain, setSelectedChain] =
    useState<number>(defaultSelectedChain)

  const onConfirmSignature = async () => {
    try {
      setLoading(true)

      toast.info("Verifying contract...")

      const verificationResult = await verifyContract({
        projectId,
        contractAddress: contract as `0x${string}`,
        deployerAddress: deployer as `0x${string}`,
        deploymentTxHash: txHash as `0x${string}`,
        signature: signature as `0x${string}`,
        chain: selectedChain!,
      })

      if (verificationResult.error !== null) {
        toast.error(verificationResult.error)
        setError(verificationResult.error)
        return
      }

      setError(undefined)

      toast.success("Successfully verified contract!")
      onSubmit({
        address: verificationResult.contract[0].contractAddress,
        chainId: verificationResult.contract[0].chainId.toString(),
      })
    } catch (_) {
      toast.error("An error occurred, please try again")

      setError("An error occurred, please try again")
    } finally {
      setLoading(false)
    }
  }

  async function onChainChange(value: string) {
    setSelectedChain(parseInt(value))
  }

  const [contract, setContract] = useState("")
  const [txHash, setTxHash] = useState("")
  const [deployer, setDeployer] = useState(deployerAddress)

  async function onContractChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContract(event.target.value)
  }

  async function onTxHashChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTxHash(event.target.value)
  }

  async function onDeployerChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDeployer(event.target.value as `0x${string}`)
  }

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
          <div className="flex flex-col self-stretch gap-4">
            <FormField
              name={``}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">
                    Deployer address
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={deployerAddress}
                      placeholder="0x..."
                      className=""
                      onChange={onDeployerChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={``}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground !mt-0">
                    Contract
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0x…"
                      onChange={onContractChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={``}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">
                    Deployment tx hash
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0x..."
                      className=""
                      onChange={onTxHashChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ChainSelector2 defaultValue={"10"} onChange={onChainChange} />

            <Button
              variant={"destructive"}
              className="mt-10 disabled:bg-destructive/80 disabled:text-white"
              disabled={
                !isAddress(deployer) || !isAddress(contract) || !isHex(txHash)
              }
              onClick={onConfirmSignature}
            >
              Verify
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
