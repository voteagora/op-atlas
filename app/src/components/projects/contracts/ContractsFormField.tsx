import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { useFieldArray, UseFormReturn } from "react-hook-form"
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
  const { fields: contractsFields } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`,
  })

  const initialMaxContractViewCount = 6
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

  return (
    <>
      {contractsFields.length > 0 && <p>Contracts</p>}

      {contractsFields.map((field, index) => {
        if (index >= contractViewCount) return

        return (
          <ContractFormField
            key={field.id}
            form={form}
            deployerIndex={deployerIndex}
            contractIndex={index}
          />
        )
      })}

      {contractViewCount < contractsFields.length && (
        <button
          className="flex items-center gap-2"
          onClick={() => {
            setContractViewCount(contractsFields.length)
          }}
        >
          <p>
            Show {contractsFields.length - initialMaxContractViewCount} more
            contract(s)
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
            Hide {contractsFields.length - initialMaxContractViewCount}{" "}
            contract(s)
          </p>
          <ChevronUp width={16} height={16} />
        </button>
      )}
    </>
  )
}
