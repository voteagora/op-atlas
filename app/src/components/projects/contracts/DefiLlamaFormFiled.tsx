import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import { FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { DeployersSchema } from "./ContractFormSchema"

interface DefiLlamaFormFiledProps {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  index: number
  onRemove: (index: number) => void
}

export function DefiLlamaFormFiled({
  form,
  index,
  onRemove,
}: DefiLlamaFormFiledProps) {
  const fieldName = `defillamaSlug.${index}.slug` as const
  const field = form.register(fieldName)
  const fieldState = form.getFieldState(fieldName)
  const value = form.watch(fieldName)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim()
    form.setValue(fieldName, newValue || undefined, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleRemove = () => {
    onRemove(index)
  }

  return (
    <FormItem className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="https://defillama.com/protocol/..."
          {...field}
          value={value || ""}
          onChange={handleInputChange}
          className={fieldState.error ? "border-red-500" : ""}
        />
        <Button
          variant="secondary"
          onClick={handleRemove}
          disabled={!form.watch(fieldName)}
        >
          Remove
        </Button>
      </div>

      {fieldState.error?.message && (
        <p className="text-sm text-destructive">{fieldState.error.message}</p>
      )}
    </FormItem>
  )
}
