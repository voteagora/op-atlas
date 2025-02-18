import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import { FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { DeployersSchema } from "./ContractFormSchema"

export function DefiLlamaFormFiled({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  index: number
  onRemove: (index: number) => void
}) {
  return (
    <FormField
      control={form.control}
      name={`defillamaSlug.${index}.slug`}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://defillama.com/protocol/..."
              {...field}
              onChange={(e) => {
                if (e.target.value === "") {
                  field.onChange(undefined)
                } else {
                  field.onChange(e.target.value)
                }
              }}
              className={
                form.formState.errors.defillamaSlug?.[index]?.slug
                  ? "border-red-500"
                  : ""
              }
            />
            <Button
              variant="secondary"
              onClick={() => onRemove(index)}
              disabled={!field.value}
            >
              Remove
            </Button>
          </div>

          {/* Try multiple ways to access the error */}
          {(form.formState.errors?.defillamaSlug?.[index]?.slug?.message ||
            form.getFieldState(`defillamaSlug.${index}.slug`).error
              ?.message) && (
            <p className="text-sm text-destructive">
              {form.formState.errors?.defillamaSlug?.[index]?.slug?.message ||
                form.getFieldState(`defillamaSlug.${index}.slug`).error
                  ?.message}
            </p>
          )}
        </FormItem>
      )}
    />
  )
}
