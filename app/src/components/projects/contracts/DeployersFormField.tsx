import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { DeployersSchema } from "./ContractFormSchema"
import { DeployerFormField } from "./DeployerFormField"

export function DeployersFormField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
}) {
  const {
    fields: deployersFields,
    remove: removeDeployerField,
  } = useFieldArray({
    control: form.control,
    name: "deployers",
  })

  async function onRemoveDeployerField(index: number) {
    removeDeployerField(index)
  }

  const hasContracts = deployersFields.some((_, index) => {
    const contracts = form.watch(`deployers.${index}.contracts`)
    return contracts.length > 0
  })

  if (!hasContracts) {
    return null
  }

  return (
    <div className="flex flex-col gap-10 mt-10">
      <h3 className="text-xl">Verified contracts</h3>
      <p className="text-secondary-foreground text-sm">
        These are your previously verified contracts. New contract verification
        via deployer address is no longer available.
      </p>
      <div className="flex flex-col gap-2">
        {deployersFields.map((field, index) => (
          <DeployerFormField
            key={field.id}
            form={form}
            deployerIndex={index}
            onRemove={onRemoveDeployerField}
          />
        ))}
      </div>
    </div>
  )
}
