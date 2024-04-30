import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { CHAIN_INFO } from "@/components/common/chain"
import { ChainLogo } from "@/components/common/ChainLogo"
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
                  <div className="flex gap-2 items-center py-1">
                    <ChainLogo chainId={chain} />
                    <div>{CHAIN_INFO[chain]?.name}</div>
                  </div>
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
