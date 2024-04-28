import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsSchema } from "./schema"
import { ChainSelector } from "./ChainSelector"

export function ContractForm({
  index,
  form,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema>>
  index: number
}) {
  return (
    <div className="flex flex-col gap-y-6 p-6 border rounded-xl">
      <div className="flex flex-col">
        <h3>Add a contract</h3>
        <div className="text-text-secondary">
          Sign a message onchain to verify that you own this contract.
        </div>
      </div>
      <FormField
        control={form.control}
        name={`contracts.${index}.contractAddress`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">Contract</FormLabel>
            <FormControl>
              <Input {...field} placeholder="0x..." className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`contracts.${index}.deploymentTxHash`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              Deployment tx hash
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="0x..." className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`contracts.${index}.deployerAddress`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">Deployer address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="0x..." className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <ChainSelector form={form} index={index} />
    </div>
  )
}
