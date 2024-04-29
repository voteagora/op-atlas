import { UseFormReturn, useWatch } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { type Address, isAddress, isAddressEqual, isHex } from "viem"
import Image from "next/image"
import { X } from "lucide-react"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChainLogo } from "@/components/common/ChainLogo"
import { ContractSchema, ContractsSchema } from "./schema"
import { ChainSelector } from "./ChainSelector"
import { VerifyAddressDialog } from "./VerifyAddressDialog"

export function ContractForm({
  index,
  form,
  remove,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema>>
  index: number
  remove: () => void
}) {
  const [isVerifying, setIsVerifying] = useState(false)
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

  const onVerify = () => {
    if (!isAddress(deployerAddress)) return

    const otherVerifiedContract = contracts.find(
      (contract: z.infer<typeof ContractSchema>) =>
        isAddressEqual(contract.deployerAddress as Address, deployerAddress) &&
        Boolean(contract.signature),
    )

    if (otherVerifiedContract) {
      form.setValue(
        `contracts.${index}.signature`,
        otherVerifiedContract.signature,
      )
    } else {
      setIsVerifying(true)
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
        <div className="flex px-3 py-2 border items-center rounded-lg">
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
      </div>
    )
  }

  return (
    <>
      {isVerifying && (
        <VerifyAddressDialog
          open
          onOpenChange={(open) => !open && setIsVerifying(false)}
          deployerAddress={deployerAddress}
          onSubmit={onValidSignature}
        />
      )}
      <div className="flex flex-col gap-y-6 p-6 border rounded-xl">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h3>Add a contract</h3>
            {index > 0 && (
              <Button onClick={remove} className="self-end p-2" variant="ghost">
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>

          <div className="text-text-secondary">
            Sign a message onchain to verify that you own this contract.
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
            disabled={!canVerify}
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
