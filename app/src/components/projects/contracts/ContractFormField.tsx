import { FormField, FormItem } from "@/components/ui/form"
import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { UseFormReturn } from "react-hook-form"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Check, FileQuestion, X } from "lucide-react"
import { truncate } from "@/lib/utils/contracts"
import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"
import { CHAIN_INFO } from "@/components/common/chain"
import { ContractDropdownButton } from "./ContractDropdownButton"

const onCopyValue = async (value: string) => {
  try {
    await copyToClipboard(value)
    toast("Copied to clipboard")
  } catch (error) {
    toast.error("Error copying to clipboard")
  }
}

export function ContractFormField({
  form,
  deployerIndex,
  contractIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
  contractIndex: number
}) {
  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}.contracts.${contractIndex}`}
      render={({ field: contract }) => (
        <div>
          <FormItem className="flex flex-col gap-1.5">
            <div className="flex group">
              <div className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex items-center gap-2">
                  <div>
                    {contract.value.excluded ? (
                      <X width={20} height={20} color="grey" />
                    ) : (
                      <Check width={20} height={20} color="green" />
                    )}
                  </div>

                  {contract.value?.chainId === "NaN" ? (
                    <div className="relative group/btn">
                      <FileQuestion className="w-6 h-6" />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg w-80 text-center">
                        {"This contract is on an unsupported chain."}
                      </span>
                    </div>
                  ) : (
                    <div className="relative group/btn">
                      <ChainLogo chainId={contract.value?.chainId} size={24} />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg text-center">
                        {CHAIN_INFO[contract.value?.chainId].name}
                      </span>
                    </div>
                  )}

                  <button
                    className="relative group/btn hover:bg-gray-200 px-2 rounded-lg"
                    type="button"
                    onClick={() => {
                      onCopyValue(contract.value.address)
                    }}
                  >
                    {truncate(contract.value?.address, 5)}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg">
                      {contract.value?.address}
                    </span>
                  </button>

                  {contract.value.excluded && (
                    <div className="bg-rose-300 rounded-lg px-2">Excluded</div>
                  )}
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`deployers.${deployerIndex}.contracts.${contractIndex}.excluded`}
                    render={({ field: excludedField }) => (
                      <>
                        {
                          <button
                            type="button"
                            className="bg-secondary px-2 rounded-lg opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              excludedField.onChange(!excludedField.value)
                            }}
                          >
                            {!excludedField.value ? "Exclude" : "Include"}
                          </button>
                        }

                        <ContractDropdownButton
                          form={form}
                          field={excludedField}
                          index={contractIndex}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </FormItem>
        </div>
      )}
    />
  )
}
