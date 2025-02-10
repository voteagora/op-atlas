import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DeployersSchema } from "./schema3"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DeployerFormField } from "./DeployerFormField"
import { isAddress } from "viem"

export function DeployersFormField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
}) {
  const {
    fields: deployersFields,
    append: addDeployerField,
    remove: removeDeployerField,
  } = useFieldArray({
    control: form.control,
    name: "deployers",
  })

  async function onAddDeployerField() {
    addDeployerField({ address: "", contracts: [] })
  }

  async function onRemoveDeployerField(index: number) {
    removeDeployerField(index)
  }

  return (
    <>
      {deployersFields.map((field, index) => (
        <DeployerFormField
          key={field.id}
          form={form}
          deployerIndex={index}
          onRemove={onRemoveDeployerField}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        disabled={
          !form.getValues(`deployers`).every((deployer, index, array) => {
            // Check that each repo.name is not empty and is unique
            return (
              deployer.address &&
              isAddress(deployer.address) &&
              array.findIndex((r) => r.address === deployer.address) === index
            )
          })
        }
        onClick={onAddDeployerField}
        className="mt-4 w-fit"
      >
        <Plus size={16} className="mr-2.5" /> Add another deployer
      </Button>
    </>
  )
}
