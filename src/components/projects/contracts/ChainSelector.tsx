import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Chain, ContractsSchema } from "./schema"

export function ChainSelector({
  index,
  form,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema>>
  index: number
}) {
  return (
    <FormField
      control={form.control}
      name={`contracts.${index}.chain`}
      render={({ field }) => (
        <FormItem className="w-60">
          <FormLabel>Chain</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Chain.options.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
