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

export function DeployersFormField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
}) {
  const { append } = useFieldArray({
    control: form.control,
    name: "deployers", // Name of the array field
  })

  return (
    <FormField
      control={form.control}
      name={`deployers`}
      render={({ field: deployers }) => (
        <div className="flex flex-col gap-4">
          {deployers?.value?.map((deployer, deployerIndex) => {
            return (
              <div
                key={"Deployer" + deployerIndex}
                className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6"
              >
                <FormField
                  control={form.control}
                  name={`deployers.${deployerIndex}.address`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FormLabel>Deployer Address</FormLabel>
                      <Input {...field} placeholder="Add a deployer address" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ContractsFormField form={form} deployerIndex={deployerIndex} />
              </div>
            )
          })}

          <Button
            variant={"ghost"}
            className="bg-secondary w-[200px]"
            type="button"
            onClick={() => {
              append({ address: "", contracts: [] })
            }}
          >
            <Plus width={16} height={16} />
            Add deployer address
          </Button>
        </div>
      )}
    />
  )
}
