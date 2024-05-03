import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { ReposFormSchema } from "./schema"

export const PackageForm = ({
  form,
  index,
}: {
  form: UseFormReturn<z.infer<typeof ReposFormSchema>>
  index: number
}) => {
  return (
    <FormField
      control={form.control}
      name={`packages.${index}.url`}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5">
          <FormControl>
            <Input {...field} placeholder="Ex: npmjs.com/package/..." />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
