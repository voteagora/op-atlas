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
import { Check, ChevronDown, Loader2, Plus } from "lucide-react"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Checkbox } from "@/components/ui/checkbox"
import { Callout } from "@/components/common/Callout"

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

const initialMaxContractViewCount = 2

export function DeployerForm({
  index,
  form,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema2>>
  index: number
}) {
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

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

    const contracts: { address: string; chain: number }[] = mockContracts

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
          We couldn’t find any contracts deployed by this address. Learn more
          about <span className="underline">missing contracts</span>
        </p>,
      )
      setIsValidDeployer(false)
    } else {
      setIsSelectingContracts(true)
    }
  }

  let contracts = form.getValues().deployers[index].contracts

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

  const [userDeployerContracts, setUserDeployerContracts] = useState([])

  const [isSelectingContracts, setIsSelectingContracts] = useState(false)

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

      {errorMessage}

      {contracts.length > 0 ||
        (userDeployerContracts.length > 0 && <p>Contracts</p>)}

      {contracts.length > 0 && (
        <>
          {contracts.length > 0 && (
            <div>
              <Checkbox
                checked={isAllContractsSelected}
                onCheckedChange={handleSelectAllContracts}
              />
              Select all contracts
            </div>
          )}

          {contracts.map((contract: any, contractIndex: number) => {
            if (contractIndex >= contractViewCount) return

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

          {contracts.length > 0 && contractViewCount !== contracts.length && (
            <button
              className="flex items-center gap-2"
              onClick={() => {
                setContractViewCount(contracts.length)
              }}
            >
              <p>
                Show {contracts.length - initialMaxContractViewCount} more
                contracts
              </p>
              <ChevronDown width={16} height={16} />
            </button>
          )}

          {contracts.length > 0 && (
            <div className="flex justify-between items-end">
              <Button
                disabled={!contracts.some((contract: any) => contract.selected)}
                variant={"destructive"}
                className="gap-2"
                onClick={() => {
                  setUserDeployerContracts(
                    contracts.filter((contract: any) => contract.selected),
                  )

                  setIsSelectingContracts(false)
                  contracts = []
                }}
              >
                {contracts.filter((contract: any) => contract.selected).length >
                  0 && (
                  <p className="px-2 py-0.5 rounded-lg bg-rose-900">
                    {
                      contracts.filter((contract: any) => contract.selected)
                        .length
                    }
                  </p>
                )}

                <p>Add to project</p>
              </Button>
            </div>
          )}
        </>
      )}

      {userDeployerContracts.length > 0 && (
        <>
          <Callout
            type="info"
            text="To see all contracts from this deployer, choose"
            linkText="view and edit contracts."
          />
          {userDeployerContracts.map((contract: any, contractIndex: number) => {
            if (contractIndex >= contractViewCount) return

            return (
              <div className="flex">
                <div className="flex items-center space-x-2 border border-input p-3 h-10 rounded-lg w-full">
                  <Check width={16} height={16} />
                  <ChainLogo chainId={contract.chain} size={24} />
                  <p>{contract.address}</p>
                </div>
              </div>
            )
          })}
        </>
      )}
      <div className="flex justify-between items-end">
        <Button variant={"ghost"} className="gap-2">
          <Plus width={16} height={16} />
          Add deployer address
        </Button>
      </div>
      {isVerifying && (
        <div className="flex items-center">
          <Loader2 width={16} height={16} />
          <p>Searching for contracts</p>
        </div>
      )}

      {contracts.length <= 0 && (
        <div className="flex justify-between items-end">
          <Button variant="destructive" type="button" onClick={handleOnClick}>
            {errorMessage ? "Retry" : "Verify"}
          </Button>
        </div>
      )}
    </>
  )
}
