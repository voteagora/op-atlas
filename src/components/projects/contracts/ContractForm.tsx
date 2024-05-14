import { Ellipsis, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import {
  type Address,
  getAddress,
  isAddress,
  isAddressEqual,
  isHex,
} from "viem"
import { z } from "zod"

import { ChainLogo } from "@/components/common/ChainLogo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { verifyContract } from "@/lib/actions/contracts"
import { copyToClipboard } from "@/lib/utils"

import { ChainSelector } from "./ChainSelector"
import { ContractSchema, ContractsSchema } from "./schema"
import { VerifyAddressDialog } from "./VerifyAddressDialog"

export function ContractForm({
  projectId,
  index,
  form,
  removeVerified,
  removeEmpty,
}: {
  projectId: string
  form: UseFormReturn<z.infer<typeof ContractsSchema>>
  index: number
  removeVerified: () => void
  removeEmpty: () => void
}) {
  const { toast } = useToast()

  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { contracts } = useWatch({
    control: form.control,
  })

  const {
    contractAddress,
    deployerAddress,
    deploymentTxHash,
    signature,
    chain,
  } = contracts[index]

  const onCopyValue = async (value: string) => {
    try {
      await copyToClipboard(value)
      toast({ title: "Copied to clipboard" })
    } catch (error) {
      toast({ title: "Error copying to clipboard", variant: "destructive" })
    }
  }

  const onVerify = async () => {
    if (!isAddress(deployerAddress)) return

    setIsLoading(true)

    try {
      const otherVerifiedContract = contracts.find(
        (contract: z.infer<typeof ContractSchema>) =>
          isAddressEqual(
            contract.deployerAddress as Address,
            deployerAddress,
          ) && Boolean(contract.signature),
      )

      if (otherVerifiedContract) {
        // We can shortcut and verify here
        const verificationResult = await verifyContract({
          projectId,
          contractAddress,
          deployerAddress,
          deploymentTxHash,
          signature: "0x0",
          chain,
        })

        if (!verificationResult.error) {
          form.setValue(
            `contracts.${index}.signature`,
            otherVerifiedContract.signature,
          )
        } else {
          // Fall back to full verification
          setIsVerifying(true)
        }
      } else {
        setIsVerifying(true)
      }
    } catch (error) {
      console.error("Error verifying contract", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onValidSignature = (sig: string) => {
    form.setValue(`contracts.${index}.signature`, sig)
    setIsVerifying(false)
  }

  const canVerify =
    isAddress(contractAddress) &&
    isAddress(deployerAddress) &&
    isHex(deploymentTxHash)

  if (signature) {
    return (
      <div className="flex flex-col gap-2">
        <FormLabel>Contract {index + 1}</FormLabel>
        <div className="flex items-center gap-1.5">
          <div className="flex flex-1 px-3 py-2 border items-center rounded-lg">
            <div className="pr-2 border-r">
              <Image
                src="/assets/icons/circle-check-green.svg"
                height={16.67}
                width={16.67}
                alt="Verified"
              />
            </div>
            <div className="px-2 text-secondary-foreground flex items-center gap-1.5">
              <ChainLogo chainId={chain} size={18} />
              {contractAddress}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onCopyValue(contractAddress)}
              >
                Copy contract address
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onCopyValue(deploymentTxHash)}
              >
                Copy deployment tx hash
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onCopyValue(deployerAddress)}
              >
                Copy deployer address
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={removeVerified}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <>
      {isVerifying && (
        <VerifyAddressDialog
          open
          onOpenChange={(open) => !open && setIsVerifying(false)}
          projectId={projectId}
          deployerAddress={deployerAddress}
          contractAddress={getAddress(contractAddress)}
          deploymentTxHash={deploymentTxHash}
          onSubmit={onValidSignature}
          chain={chain}
        />
      )}
      <div className="flex flex-col gap-y-6 p-6 border rounded-xl">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3>Add a contract</h3>
              <p className="text-secondary-foreground">
                Sign a message onchain to verify that you own this contract.
              </p>
            </div>
            {index > 0 && (
              <Button onClick={removeEmpty} className="p-2" variant="ghost">
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
        <FormField
          control={form.control}
          name={`contracts.${index}.contractAddress`}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-foreground">Contract</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0x..." className="" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`contracts.${index}.deploymentTxHash`}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-foreground">
                Deployment tx hash
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="0x..." className="" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`contracts.${index}.deployerAddress`}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-foreground">
                Deployer address
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="0x..." className="" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-end">
          <ChainSelector form={form} index={index} />
          <Button
            disabled={!canVerify || isLoading}
            variant="destructive"
            type="button"
            onClick={onVerify}
          >
            Verify
          </Button>
        </div>
      </div>
    </>
  )
}
