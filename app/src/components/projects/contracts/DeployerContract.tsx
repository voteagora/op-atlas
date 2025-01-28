import { ChainLogo } from "@/components/common/ChainLogo"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { Check, Ellipsis, X } from "lucide-react"
import { useState } from "react"

export function DeployerContract({
  contract,
  form,
  deployerIndex,
  contractIndex,
}: {
  contract: any
  form: any
  deployerIndex: number
  contractIndex: number
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="flex">
      <FormField
        control={form.control}
        name={`deployers.${deployerIndex}.contracts.${contractIndex}`}
        render={({ field }) => (
          <FormItem className="flex items-center justify-between border border-input p-3 h-10 rounded-lg w-full">
            <div className="flex items-center">
              {field.value.selected ? (
                <Check width={16} height={16} />
              ) : (
                <X width={16} height={16} />
              )}
              <ChainLogo chainId={contract.chain} size={24} />
              <p>{contract.address}</p>
            </div>

            <div className="flex gap-4">
              {field.value.initialSelected !== field.value.selected && (
                <p className="text-sm rounded-lg bg-gray-200 px-2 py-.5">
                  {field.value.selected ? "Include" : "Exclude"}
                </p>
              )}
              <button
                type="button"
                className="flex items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Ellipsis width={16} height={16} />
                {isDropdownOpen && (
                  <div className="relative inline-block text-left">
                    <div className="absolute mt-2 -right-1 w-48 bg-white border rounded-md shadow-lg">
                      <ul className="py-1 text-sm text-gray-700">
                        <li>
                          <FormField
                            control={form.control}
                            name={`deployers.${deployerIndex}.contracts.${contractIndex}.selected`}
                            render={({ field }) => (
                              <button
                                type="button"
                                className="block px-4 py-2 hover:bg-gray-100"
                                onClick={() => field.onChange(!field.value)}
                              >
                                {field.value
                                  ? "Exclude from project"
                                  : "Include in project"}
                              </button>
                            )}
                          />
                        </li>
                        <li>
                          <button className="block px-4 py-2 hover:bg-gray-100">
                            Copy address
                          </button>
                        </li>
                        <li>
                          <button className="block px-4 py-2 hover:bg-gray-100">
                            Edit name
                          </button>
                        </li>
                        <li>
                          <button className="block px-4 py-2 hover:bg-gray-100">
                            View attestation
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
