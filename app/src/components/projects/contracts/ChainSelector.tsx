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
import { getAtlasSupportedNetworksWithAttributes } from "@/components/common/chain"

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
            <SelectContent>
              {Chain.options.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  <div className="flex gap-2 items-center py-1">
                    <ChainLogo chainId={Number(chain)} />
                    <div>
                      {
                        Object.values(
                          getAtlasSupportedNetworksWithAttributes(),
                        ).find((chain2) => chain2.id.toString() === chain)?.name
                      }
                    </div>
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
