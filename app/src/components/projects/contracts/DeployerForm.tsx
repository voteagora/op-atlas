import {
  useFieldArray,
  useFormContext,
  UseFormReturn,
  useWatch,
} from "react-hook-form"
import { isAddress } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsSchema2 } from "./schema2"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Checkbox } from "@/components/ui/checkbox"

const mockContracts = [
  {
    address: "0x123",
    chain: 8453,
  },
  {
    address: "0x456",
    chain: 34443,
  },
  {
    address: "0x789",
    chain: 10,
  },

  {
    address: "0x111",
    chain: 10,
  },
]

export function DeployerForm({
  index,
  form,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema2>>
  index: number
}) {
  const { deployers } = useWatch({
    control: form.control,
  })

  const { fields, append, update } = useFieldArray({
    control: form.control,
    name: "deployers",
  })

  const isValidAddress = isAddress(deployers[index]?.deployerAddress)

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<
    React.ReactNode | undefined
  >()

  const [isValidDeployer, setIsValidDeployer] = useState(false)

  const handleOnClick = async () => {
    setErrorMessage(undefined)
    setIsVerifying(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsVerifying(false)

    const contracts = mockContracts

    const contractsWithSelected = contracts.map((contract) => {
      return { ...contract, selected: false }
    })

    const updatedContracts = [...contractsWithSelected]
    update(index, {
      ...fields[index],
      contracts: updatedContracts,
    })

    if (contracts.length <= 0) {
      setErrorMessage(
        <p className="text-rose-600">
          We couldn’t find any contracts deployed by this address. (Contracts
          deployed within the last 24 hours may not appear—verify recent
          deployments with{" "}
          <button className="underline">manual contract verification.</button>)
        </p>,
      )
      setIsValidDeployer(false)
    }
  }

  const contracts = form.getValues().deployers[index].contracts

  const isAllContractsSelected = contracts.every(
    (contract: any) => contract.selected,
  )

  async function handleSelectAllContracts() {
    contracts.forEach((contract: any, contractIndex: number) => {
      form.setValue(
        `deployers.${index}.contracts.${contractIndex}.selected`,
        !isAllContractsSelected,
      )
    })
  }

  return (
    <>
      <FormField
        control={form.control}
        name={`deployers.${index}.deployerAddress`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">Deployer address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="0x..." className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Checkbox
          checked={isAllContractsSelected}
          onCheckedChange={handleSelectAllContracts}
        />
        Select all contracts
      </div>

      {contracts.map((contract: any, contractIndex: number) => {
        return (
          <div className="flex">
            <FormField
              control={form.control}
              name={`deployers.${index}.contracts.${contractIndex}.selected`}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 border border-input p-3 h-10 rounded-lg w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <ChainLogo chainId={contract.chain} size={24} />
                  <p>{contract.address}</p>
                </FormItem>
              )}
            />
          </div>
        )
      })}
      {isVerifying && (
        <div className="flex items-center">
          <Loader2 width={16} height={16} />
          <p>Searching for contracts</p>
        </div>
      )}

      {errorMessage && errorMessage}
      <div className="flex justify-between items-end">
        <Button
          variant="destructive"
          type="button"
          disabled={!isValidAddress}
          onClick={handleOnClick}
        >
          {errorMessage ? "Retry" : "Verify"}
        </Button>
      </div>
    </>
  )
}
