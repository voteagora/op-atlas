"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import Input from "@/components/common/Input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useAppDialogs } from "@/providers/DialogProvider"
import Link from "next/link"

const FormSchema = z.object({
  address: z.string().nonempty(),
  confirmIsOpMainnet: z.boolean().default(false),
  confirmCanMakeContractCalls: z.boolean().default(false),
  pledgeToChooseDelegate: z.boolean().default(false),
})

export default function DeliveryAddressVerificationForm({
  organizationProject,
}: {
  organizationProject: boolean
}) {
  const { setOpenDialog, setData } = useAppDialogs()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      address: "",
      confirmIsOpMainnet: false,
      confirmCanMakeContractCalls: false,
      pledgeToChooseDelegate: false,
    },
  })

  const submitEnabled =
    form.watch("confirmIsOpMainnet") &&
    form.watch("confirmCanMakeContractCalls") &&
    form.watch("pledgeToChooseDelegate") &&
    form.watch("address")

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setData({
      address: data.address,
      organizationProject,
    })
    setOpenDialog("verify_grant_delivery_address")
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit)(e)
          form.reset()
        }}
        className="w-full space-y-4"
      >
        <div className="w-full space-y-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <Input
                    leftIcon="/assets/chain-logos/optimism.svg"
                    placeholder="0x..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmIsOpMainnet"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-secondary-foreground">
                  I confirm this address is on OP Mainnet
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmCanMakeContractCalls"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-secondary-foreground">
                  I confirm this address can make contract calls
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pledgeToChooseDelegate"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-secondary-foreground">
                  I pledge to choose a delegate for this wallet in{" "}
                  <Link
                    href="https://vote.optimism.io/delegates"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Optimism Agora
                  </Link>
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <Button variant="primary" type="submit" disabled={!submitEnabled}>
          Verify
        </Button>
      </form>
    </Form>
  )
}
