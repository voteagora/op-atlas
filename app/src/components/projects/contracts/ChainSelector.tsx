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
import { getAtlasSupportedNetworkWithAttributes } from "@/components/common/chain"

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
              {Chain.options.map((chain) => {
                var chainIdConvertedFromZodEnum = Number(chain)

                return (
                  <SelectItem key={chain} value={chain}>
                    <div className="flex gap-2 items-center py-1">
                      <ChainLogo chainId={chainIdConvertedFromZodEnum} />
                      <div>
                        {
                          getAtlasSupportedNetworkWithAttributes(
                            chainIdConvertedFromZodEnum,
                          )?.name
                        }
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
