import { ChevronDown, ChevronUp, Ellipsis, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { toast } from "sonner"
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
import { Textarea } from "@/components/ui/textarea"
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
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormExpanded, setIsRepoFormExpanded] = useState(true)

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
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying to clipboard")
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
          toast.success("Contract verified")
        } else {
          toast.error(verificationResult.error ?? "Error verifying contract")
        }
      } else {
        setIsVerifying(true)
      }
    } catch (error) {
      toast.error("There was an error verifying your contract.")
    } finally {
      setIsLoading(false)
    }
  }

  const onValidSignature = (sig: string) => {
    toast.success("Contract verified")
    form.setValue(`contracts.${index}.signature`, sig)
    setIsVerifying(false)
  }

  const canVerify =
    isAddress(contractAddress) &&
    isAddress(deployerAddress) &&
    isHex(deploymentTxHash)

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
          <div className="flex justify-end">
            {index > 0 && (
              <Button onClick={removeEmpty} className="p-2" variant="ghost">
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>

        {signature ? (
          <div className="flex flex-col gap-2">
            <FormLabel>Contract</FormLabel>
            <div className="flex items-center gap-1.5">
              <div className="flex flex-1 px-3 py-2 border items-center rounded-lg">
                <Image
                  src="/assets/icons/circle-check-green.svg"
                  height={16.67}
                  width={16.67}
                  alt="Verified"
                />

                <div className="px-2 text-sm  text-secondary-foreground flex items-center gap-1.5">
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
        ) : (
          <>
            <FormField
              control={form.control}
              name={`contracts.${index}.contractAddress`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground !mt-0">
                    Contract
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0x…" />
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
                    <span className="ml-0.5 text-destructive">*</span>
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
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0x..." className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ChainSelector form={form} index={index} />
          </>
        )}

        {(isFormExpanded || !signature) && (
          <>
            <FormField
              control={form.control}
              name={`contracts.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Add a name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`contracts.${index}.description`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe this contribution"
                    className="resize-y min-h-[100px]"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-between items-end">
          {signature ? (
            <Button
              onClick={() => setIsRepoFormExpanded(!isFormExpanded)}
              variant="ghost"
              type="button"
              className="!p-0 text-sm font-medium text-secondary-foreground"
            >
              {isFormExpanded
                ? "Hide additional inputs"
                : "Show additional inputs"}{" "}
              {isFormExpanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>
          ) : (
            <Button
              disabled={!canVerify || isLoading}
              variant="destructive"
              type="button"
              onClick={onVerify}
            >
              Verify
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
