import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { UseFormReturn } from "react-hook-form"
import { ContractFormField } from "./ContractFormField"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function ContractsFormField({
  form,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
}) {
  const initialMaxContractViewCount = 6
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

  return (
    <FormItem className="flex flex-col gap-1.5">
      <FormField
        control={form.control}
        name={`deployers.${deployerIndex}.contracts`}
        render={({ field: contracts }) => (
          <div>
            <FormLabel>Contracts</FormLabel>

            <div className="flex flex-col gap-2">
              {contracts.value.map((contract, index) => {
                if (index >= contractViewCount) return

                return (
                  <ContractFormField
                    key={"Contracts-" + deployerIndex + "-" + index}
                    form={form}
                    deployerIndex={deployerIndex}
                    contractIndex={index}
                  />
                )
              })}
            </div>

            {contractViewCount < contracts.value.length && (
              <button
                className="flex items-center gap-2"
                onClick={() => {
                  setContractViewCount(contracts.value.length)
                }}
              >
                <p>
                  Show {contracts.value.length - initialMaxContractViewCount}{" "}
                  more contract(s)
                </p>
                <ChevronDown width={16} height={16} />
              </button>
            )}

            {contractViewCount > initialMaxContractViewCount && (
              <button
                className="flex items-center gap-2"
                onClick={() => {
                  setContractViewCount(initialMaxContractViewCount)
                }}
              >
                <p>
                  Hide {contracts.value.length - initialMaxContractViewCount}{" "}
                  contract(s)
                </p>
                <ChevronUp width={16} height={16} />
              </button>
            )}
          </div>
        )}
      />
      <FormMessage />
    </FormItem>
  )
}
