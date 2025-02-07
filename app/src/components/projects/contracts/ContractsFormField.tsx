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

export function ContractsFormField({
  form,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
}) {
  return (
    <FormItem className="flex flex-col gap-1.5">
      <FormLabel>Contracts</FormLabel>
      <FormField
        control={form.control}
        name={`deployers.${deployerIndex}.contracts`}
        render={({ field: contracts }) => (
          <div>
            {contracts.value.map((contract, index) => {
              return (
                <ContractFormField
                  form={form}
                  deployerIndex={deployerIndex}
                  contractIndex={index}
                />
              )
            })}
          </div>
        )}
      />
      <FormMessage />
    </FormItem>
  )
}
