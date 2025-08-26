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

import { Chain } from "./ContractFormSchema"

export function ChainSelector({
  defaultValue,
  onChange,
}: {
  defaultValue: string
  onChange: (value: string) => void
}) {
  return (
    <FormField
      name={``}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Chain</FormLabel>
          <Select onValueChange={onChange} defaultValue={defaultValue}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="z-[201]" position="popper">
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
