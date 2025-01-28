import {
  useFieldArray,
  useFormContext,
  UseFormReturn,
  useWatch,
} from "react-hook-form"
import { isAddress } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
import { Check, ChevronDown, Ellipsis, Loader2, Plus } from "lucide-react"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Checkbox } from "@/components/ui/checkbox"
import { Callout } from "@/components/common/Callout"
import { CalloutDeleteAndReplaceMe } from "./CalloutDeleteAndReplaceMe"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import DropdownItem from "@/components/common/DropdownItem"
import { DeployerContract } from "./DeployerContract"

// const mockDeployerContracts = [
//   {
//     deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
//     contracts: [
//       {
//         address: "0x123",
//         chain: 8453,
//         selected: true,
//         initialSelected: true,
//       },
//       {
//         address: "0x456",
//         chain: 34443,
//         selected: true,
//         initialSelected: true,
//       },
//       {
//         address: "0x789",
//         chain: 10,
//         selected: true,
//         initialSelected: true,
//       },

//       {
//         address: "0x111",
//         chain: 10,
//         selected: true,
//         initialSelected: true,
//       },
//     ],
//   },
// ]

const initialMaxContractViewCount = 4

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

  const [userDeployerContractViewCount, setUserDeployerContractViewCount] =
    useState(initialMaxContractViewCount)

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

    // const deployerContracts: {
    //   deployerAddress: string
    //   contracts: { address: string; chain: number }[]
    // }[] = mockDeployerContracts

    const formValue = form.getValues(`deployers.${index}.deployerAddress`)

    console.log(formValue)

    // const foundMock = deployerContracts.find(
    //   (deployerContract) => deployerContract.deployerAddress === formValue,
    // )

    // console.log(foundMock)

    // const contractsWithSelected = foundMock?.contracts.map((contract) => {
    //   return { ...contract }
    // })

    // const contractsWithSelected = deployerContracts.find((deployerContract)=> deployerContract.deployerAddress === form.getValues(`deployers.${index}.deployerAddress`)).map((contract) => {
    //   return { ...contract, selected: false }
    // })

    // if (contractsWithSelected) {
    //   const updatedContracts = [...contractsWithSelected]

    //   console.log(updatedContracts)

    //   update(index, {
    //     ...fields[index],
    //     contracts: updatedContracts,
    //   })

    //   if (updatedContracts.length <= 0) {
    //     setErrorMessage(
    //       <p className="text-rose-600">
    //         We couldn’t find any contracts deployed by this address. Learn more
    //         about <span className="underline">missing contracts</span>
    //       </p>,
    //     )
    //     setIsValidDeployer(false)
    //   } else {
    //     toast.success(`Loaded ${contractsWithSelected.length} contracts.`)
    //     setIsSelectingContracts(true)
    //   }
    // }
  }

  // const contracts = form.getValues().deployers[index].contracts

  // const isAllContractsSelected = contracts.every(
  //   (contract: any) => contract.selected,
  // )

  // async function handleSelectAllContracts() {
  //   contracts.forEach((contract: any, contractIndex: number) => {
  //     form.setValue(
  //       `deployers.${index}.contracts.${contractIndex}.selected`,
  //       !isAllContractsSelected,
  //     )
  //   })
  // }

  const [userDeployerContracts, setUserDeployerContracts] = useState([])

  const [isSelectingContracts, setIsSelectingContracts] = useState(true)

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

            {errorMessage}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`deployers.${index}.contracts`}
        render={({ field }) => (
          <>
            <FormItem className="flex flex-col gap-1.5">
              {field.value.length > 0 ||
                (userDeployerContracts.length > 0 && <p>Contracts</p>)}

              {isSelectingContracts && (
                <>
                  {/* {contracts.length > 0 && (
            <div>
              <Checkbox
                checked={isAllContractsSelected}
                onCheckedChange={handleSelectAllContracts}
              />
              Select all contracts
            </div>
          )} */}

                  <p>Contracts</p>
                  {field.value.map((contract: any, contractIndex: number) => {
                    if (contractIndex >= contractViewCount) return

                    return (
                      <DeployerContract
                        key={contractIndex}
                        form={form}
                        contract={contract}
                        deployerIndex={index}
                        contractIndex={contractIndex}
                      />
                    )
                  })}

                  {field.value.length > 0 &&
                    contractViewCount !== field.value.length && (
                      <button
                        className="flex items-center gap-2"
                        onClick={() => {
                          setContractViewCount(field.value.length)
                        }}
                      >
                        <p>
                          Show{" "}
                          {field.value.length - initialMaxContractViewCount}{" "}
                          more contracts
                        </p>
                        <ChevronDown width={16} height={16} />
                      </button>
                    )}

                  {field.value.length > 0 && (
                    <div className="flex justify-between items-end">
                      <Button
                        disabled={
                          !field.value.some(
                            (contract: any) => contract.selected,
                          )
                        }
                        variant={"destructive"}
                        className="gap-2"
                        onClick={() => {
                          setUserDeployerContracts(
                            field.value.filter(
                              (contract: any) => contract.selected,
                            ),
                          )

                          setIsSelectingContracts(false)
                        }}
                      >
                        {field.value.filter(
                          (contract: any) => contract.selected,
                        ).length > 0 && (
                          <p className="px-2 py-0.5 rounded-lg bg-rose-900">
                            {
                              field.value.filter(
                                (contract: any) => contract.selected,
                              ).length
                            }
                          </p>
                        )}

                        <p>Add to project</p>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!isSelectingContracts && userDeployerContracts.length > 0 && (
                <>
                  <CalloutDeleteAndReplaceMe
                    type="info"
                    rightHandSide={
                      <p>
                        To see all contracts from this deployer, choose
                        <button
                          className="m-1 underline"
                          onClick={() => {
                            setIsSelectingContracts(true)
                          }}
                        >
                          view and edit contracts
                        </button>
                        .
                      </p>
                    }
                  />
                  {userDeployerContracts.map(
                    (contract: any, contractIndex: number) => {
                      if (contractIndex >= userDeployerContractViewCount) return

                      return (
                        <div className="flex">
                          <div className="flex items-center space-x-2 border border-input p-3 h-10 rounded-lg w-full">
                            <Check width={16} height={16} />
                            <ChainLogo chainId={contract.chain} size={24} />
                            <p>{contract.address}</p>
                          </div>
                        </div>
                      )
                    },
                  )}

                  {userDeployerContracts.length > 0 &&
                    userDeployerContractViewCount !==
                      userDeployerContracts.length && (
                      <button
                        className="flex items-center gap-2"
                        onClick={() => {
                          setUserDeployerContractViewCount(
                            userDeployerContracts.length,
                          )
                        }}
                      >
                        <p>
                          Show{" "}
                          {userDeployerContracts.length -
                            initialMaxContractViewCount}{" "}
                          more contracts
                        </p>
                        <ChevronDown width={16} height={16} />
                      </button>
                    )}
                </>
              )}

              {isVerifying && (
                <div className="flex items-center">
                  <Loader2 width={16} height={16} />
                  <p>Searching for contracts</p>
                </div>
              )}

              {field.value.length <= 0 && (
                <div className="flex justify-between items-end">
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={handleOnClick}
                  >
                    {errorMessage ? "Retry" : "Verify"}
                  </Button>
                </div>
              )}
            </FormItem>
          </>
        )}
      />
    </>
  )
}
