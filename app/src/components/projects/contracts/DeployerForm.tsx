import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { ContractsSchema2 } from "./schema2"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { VerifyButton } from "./VerifyButton"
import { Input } from "@/components/ui/input"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Check, ChevronDown, X } from "lucide-react"
import { ContractDropdownButton } from "./ContractDropdownButton"
import { ReactNode, useEffect, useState } from "react"
import { truncate } from "@/lib/utils/contracts"
import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"
import { mockOsoContracts } from "./ContractsForm2"

const onCopyValue = async (value: string) => {
  try {
    await copyToClipboard(value)
    toast("Copied to clipboard")
  } catch (error) {
    toast.error("Error copying to clipboard")
  }
}

export function DeployerForm({
  deployerIndex,
  form,
  dbData,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema2>>
  deployerIndex: number
  dbData: any
}) {
  const initialMaxContractViewCount = 3
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

  async function OnVerify() {
    setIsVerifying(true)
    setErrorMessage(undefined)

    // get OSO data

    await new Promise((resolve) => setTimeout(resolve, 2000))

    form.setValue(
      `deployers.${deployerIndex}.contracts`,
      mockOsoContracts.map((contract) => {
        return {
          ...contract,
          excluded: true,
        }
      }),
    )

    if (form.getValues().deployers[deployerIndex].contracts.length <= 0) {
      setErrorMessage(
        <p className="text-rose-600">
          We couldn’t find any contracts deployed by this address. Learn more
          about <span className="underline">missing contracts</span>
        </p>,
      )
    }

    setIsVerifying(false)

    const resultingData = mockOsoContracts.map((contract) => {
      return {
        ...contract,
        excluded: false,
      }
    })

    form.setValue(`deployers.${deployerIndex}.contracts`, [...resultingData])
  }

  const [isVerifying, setIsVerifying] = useState(false)

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

  return (
    <>
      <FormField
        control={form.control}
        name={`deployers.${deployerIndex}.address`}
        render={({ field: addressField }) => (
          <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
            <FormLabel>Deployer Address</FormLabel>
            <Input {...addressField} />
            <FormMessage />

            <VerifyButton
              form={form}
              deployerIndex={deployerIndex}
              isVerifying={isVerifying}
              errorMessage={errorMessage}
              onVerify={OnVerify}
            />

            <FormField
              control={form.control}
              name={`deployers.${deployerIndex}.contracts`}
              render={({ field: contractsField }) => (
                <div>
                  {contractsField.value.length > 0 && (
                    <>
                      <FormLabel>Contracts</FormLabel>
                      {contractsField.value?.map((contract, index) => {
                        if (index >= contractViewCount) return

                        return (
                          <FormField
                            control={form.control}
                            name={`deployers.${deployerIndex}.contracts.${index}`}
                            render={({ field: contractField }) => (
                              <div className="flex">
                                <div
                                  key={index}
                                  className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <FormField
                                      control={form.control}
                                      name={`deployers.${deployerIndex}.contracts.${index}.excluded`}
                                      render={({ field: excludedField }) => (
                                        <div>
                                          {excludedField.value ? (
                                            <X width={16} height={16} />
                                          ) : (
                                            <Check width={16} height={16} />
                                          )}
                                        </div>
                                      )}
                                    />
                                    <ChainLogo
                                      chainId={contractField.value.chain}
                                    />
                                    <button
                                      className="relative group hover:bg-gray-200 px-2 rounded-lg"
                                      type="button"
                                      onClick={() => {
                                        onCopyValue(contractField.value.address)
                                      }}
                                    >
                                      {truncate(
                                        contractField.value.address,
                                        10,
                                      )}
                                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg">
                                        {contractField.value.address}
                                      </span>
                                    </button>
                                  </div>

                                  <div className="flex gap-4">
                                    {/* <ExcludedTag form={form} contractField={contractField} deployerIndex={deployerIndex} index={index}/> */}

                                    <FormField
                                      control={form.control}
                                      name={`deployers.${deployerIndex}.contracts.${index}.excluded`}
                                      render={({ field: excludedField }) => (
                                        <>
                                          {excludedField.value &&
                                            dbData?.contracts.some(
                                              (dbContract: any) =>
                                                dbContract.address ===
                                                  contractField.value.address &&
                                                dbContract.chain ===
                                                  contractField.value.chain,
                                            ) && (
                                              <p className="bg-gray-300 rounded-lg px-2 py.5 text-sm">
                                                Exclude
                                              </p>
                                            )}

                                          {!excludedField.value &&
                                            !dbData?.contracts.some(
                                              (dbContract: any) =>
                                                dbContract.address ===
                                                  contractField.value.address &&
                                                dbContract.chain ===
                                                  contractField.value.chain,
                                            ) && (
                                              <p className="bg-gray-300 rounded-lg px-2 py.5 text-sm">
                                                Include
                                              </p>
                                            )}

                                          <ContractDropdownButton
                                            form={form}
                                            field={excludedField}
                                            index={index}
                                          />
                                        </>
                                      )}
                                    />
                                  </div>

                                  {/* Example */}
                                  {/* Add more fields related to the contract here */}
                                </div>
                              </div>
                            )}
                          />
                        )
                      })}

                      {contractsField.value &&
                        contractsField.value.length > 0 &&
                        contractViewCount < contractsField.value.length && (
                          <button
                            className="flex items-center gap-2"
                            onClick={() => {
                              setContractViewCount(contractsField.value.length)
                            }}
                          >
                            <p>
                              Show{" "}
                              {contractsField.value.length -
                                initialMaxContractViewCount}{" "}
                              more contract(s)
                            </p>
                            <ChevronDown width={16} height={16} />
                          </button>
                        )}
                    </>
                  )}
                </div>
              )}
            />
          </div>
        )}
      />
    </>
  )
}
