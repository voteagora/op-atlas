import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DeployersSchema } from "./schema3"
import { FormField } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DeployerFormField } from "./DeployerFormField"

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
              <DeployerFormField
                key={"Deployer" + deployerIndex}
                form={form}
                deployerIndex={deployerIndex}
              />
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
