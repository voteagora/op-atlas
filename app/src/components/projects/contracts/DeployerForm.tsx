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
import { getDeployerOSOData } from "./ContractsForm2"
import { isAddress } from "viem"

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

  useEffect(() => {}, [])

  async function OnVerify() {
    setIsVerifying(true)
    setErrorMessage(undefined)

    if (!isAddress(form.getValues().deployers[deployerIndex].address)) {
      setErrorMessage(
        <p className="text-rose-600">This is not a valid deployer address!</p>,
      )
      setIsVerifying(false)
      return
    }

    if (
      form.getValues().deployers.filter((deployer) => {
        return (
          deployer.address === form.getValues().deployers[deployerIndex].address
        )
      }).length > 1
    ) {
      setErrorMessage(
        <p className="text-rose-600">
          You've already verified this deployer. Please try another.
        </p>,
      )

      setIsVerifying(false)
      return
    }

    // get OSO data

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const osoDataForDeployer = getDeployerOSOData(
      form.getValues().deployers[deployerIndex].address,
    )

    console.log(osoDataForDeployer)

    if (
      !osoDataForDeployer ||
      (osoDataForDeployer?.contracts &&
        osoDataForDeployer.contracts.length <= 0)
    ) {
      setErrorMessage(
        <p className="text-rose-600">
          We couldn’t find any contracts deployed by this address. Learn more
          about <span className="underline">missing contracts</span>
        </p>,
      )
    }

    const formData = osoDataForDeployer?.contracts.map((contract) => {
      return {
        ...contract,
        excluded: false,
      }
    })

    form.setValue(`deployers.${deployerIndex}.contracts`, [...(formData || [])])

    setIsVerifying(false)
  }

  const [isVerifying, setIsVerifying] = useState(false)

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

  function isInDatabase(contract: { address: string; chain: string }) {
    return dbData?.contracts.some(
      (dbContract: any) =>
        dbContract.address === contract.address &&
        dbContract.chainId === contract.chain,
    )
  }

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
                                    <div>
                                      {!isInDatabase(contractField.value) ? (
                                        <X
                                          width={20}
                                          height={20}
                                          color="grey"
                                        />
                                      ) : (
                                        <Check
                                          width={20}
                                          height={20}
                                          color="green"
                                        />
                                      )}
                                    </div>

                                    {!isInDatabase(contractField.value) && (
                                      <div className="bg-rose-300 rounded-lg px-2">
                                        Excluded
                                      </div>
                                    )}
                                    {isInDatabase(contractField.value) && (
                                      <div className="bg-green-300 rounded-lg px-2">
                                        Included
                                      </div>
                                    )}

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
                                            isInDatabase(
                                              contractField.value,
                                            ) && (
                                              <p className="bg-gray-300 rounded-lg px-2 py.5 text-sm">
                                                Exclude
                                              </p>
                                            )}

                                          {!excludedField.value &&
                                            !isInDatabase(
                                              contractField.value,
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
