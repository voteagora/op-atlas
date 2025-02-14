"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import Accordion from "@/components/common/Accordion"
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

const FormSchema = z.object({
  confirmIsOpMainnet: z.boolean().default(false),
  confirmCanMakeContractCalls: z.boolean().default(false),
})

export default function AddGrantDeliveryAddressForm() {
  const { setOpenDialog } = useAppDialogs()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      confirmIsOpMainnet: false,
      confirmCanMakeContractCalls: false,
    },
  })

  const submitEnabled =
    form.watch("confirmIsOpMainnet") &&
    form.watch("confirmCanMakeContractCalls")

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("Submitted data:", data)
  }

  return (
    <Form {...form}>
      <div className="p-6 border rounded-md space-y-6 w-full">
        <h4 className="font-semibold">Add an address</h4>
        <Accordion
          type="multiple"
          items={[
            {
              title: (
                <AccordionTitleContainer
                  i={1}
                  text="Enter your grant delivery address"
                />
              ),
              content: (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-4"
                >
                  <div className="w-full space-y-2">
                    <Input
                      leftIcon="/assets/icons/awardsIcon.svg"
                      placeholder="0x..."
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
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!submitEnabled}
                    onClick={() => setOpenDialog("verify_address")}
                  >
                    Verify
                  </Button>
                </form>
              ),
            },
          ]}
        />
      </div>
    </Form>
  )
}

function AccordionTitleContainer({ i, text }: { i: number; text: string }) {
  return (
    <div className="font-medium text-sm flex items-center space-x-2">
      <span>{i}</span>
      <span>{text}</span>
    </div>
  )
}
