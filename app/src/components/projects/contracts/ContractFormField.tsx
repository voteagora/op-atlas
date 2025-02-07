import { FormField, FormItem } from "@/components/ui/form"
import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { UseFormReturn } from "react-hook-form"

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
                  {contract.value?.address}
                </div>
              </div>
            </div>
          </FormItem>
        </div>
      )}
    />
  )
}
