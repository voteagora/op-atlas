import { Plus } from "lucide-react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { isAddress } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"

import { DeployersSchema } from "./ContractFormSchema"
import { DeployerFormField } from "./DeployerFormField"

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
    addDeployerField({
      address: "",
      contracts: [],
      signature: "",
      verificationChainId: "",
    })
  }

  async function onRemoveDeployerField(index: number) {
    removeDeployerField(index)

    if (deployersFields.length <= 1) {
      onAddDeployerField()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-10 mt-10">
        <h3 className="text-xl">Verified contracts</h3>
        <p>
          {"Verify ownership of your  "}
          <span className="font-normal">deployer address</span>
          {
            " and OP Atlas will find your contracts. If you've deployed a factory, its contracts will be attributed to you. (Contracts deployed within 24 hours may not appear)."
          }
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

      {form.getValues(`deployers`).every((deployer) => {
        return deployer.contracts.length > 0
      }) && (
        <Button
          type="button"
          variant="secondary"
          disabled={
            !form.getValues(`deployers`).every((deployer, index, array) => {
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
      )}
    </>
  )
}
