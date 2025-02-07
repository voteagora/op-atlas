import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DeployersSchema } from "./schema3"
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsFormField } from "./ContractsFormField"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function DeployerFormField({
  form,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
}) {
  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}`}
      render={({ field: deployer }) => (
        <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.address`}
            render={({ field: address }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel>Deployer Address</FormLabel>
                <Input {...address} placeholder="Add a deployer address" />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.contracts`}
            render={({ field: contracts }) => (
              <>
                {contracts.value.length > 0 ? (
                  <ContractsFormField
                    form={form}
                    deployerIndex={deployerIndex}
                  />
                ) : (
                  <Button variant={"destructive"} className="w-20">
                    Verify
                  </Button>
                )}
              </>
            )}
          />
        </div>
      )}
    />
  )
}
