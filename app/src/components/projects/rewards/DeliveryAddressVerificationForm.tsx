"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { isAddress } from "viem"
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
  FormMessage,
} from "@/components/ui/form"
import { checkWalletAddressExistsAction } from "@/lib/actions/projects"
import { useAppDialogs } from "@/providers/DialogProvider"

const FormSchema = z.object({
  address: z
    .string()
    .nonempty("Address is required")
    .refine(
      (value) => value === "" || isAddress(value),
      "Please enter a valid Ethereum address",
    ),
  confirmIsOpMainnet: z.boolean().default(false),
  confirmCanMakeContractCalls: z.boolean().default(false),
  pledgeToChooseDelegate: z.boolean().default(false),
})

export default function DeliveryAddressVerificationForm() {
  const { setOpenDialog, setData } = useAppDialogs()
  const [isChecking, setIsChecking] = useState(false)
  const { organizationId } = useParams()

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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsChecking(true)

    try {
      const checkResult = await checkWalletAddressExistsAction(data.address)

      if (checkResult.error) {
        toast.error(checkResult.error)
        setIsChecking(false)
        return
      }

      if (checkResult.exists) {
        form.setError("address", {
          type: "manual",
          message:
            "This address is already in use by another KYC team. Please use a different address.",
        })
        setIsChecking(false)
        return
      }

      setData({
        address: data.address,
        organizationId: organizationId as string,
      })
      setOpenDialog("verify_grant_delivery_address")
    } catch (error) {
      console.error("Error checking wallet address:", error)
      toast.error("Error verifying the address. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="w-full space-y-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormControl>
                  <Input
                    leftIcon="/assets/chain-logos/optimism.svg"
                    placeholder="0x..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
        <div className="flex gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={!submitEnabled || isChecking}
          >
            {isChecking ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
