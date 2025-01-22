import { UseFormReturn, useWatch } from "react-hook-form"
import { isAddress } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsSchema2 } from "./schema2"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function DeployerForm({
  index,
  form,
}: {
  form: UseFormReturn<z.infer<typeof ContractsSchema2>>
  index: number
}) {
  const { deployers } = useWatch({
    control: form.control,
  })

  const isValidAddress = isAddress(deployers[index]?.deployerAddress)
  console.log(isValidAddress)

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<
    React.ReactNode | undefined
  >()

  const [isValidDeployer, setIsValidDeployer] = useState(false)

  const handleOnClick = async () => {
    setErrorMessage(undefined)
    setIsVerifying(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsVerifying(false)

    setErrorMessage(
      <p className="text-rose-600">
        We couldn’t find any contracts deployed by this address. (Contracts
        deployed within the last 24 hours may not appear—verify recent
        deployments with{" "}
        <button className="underline">manual contract verification.</button>)
      </p>,
    )
    setIsValidDeployer(false)
  }

  return (
    <>
      <FormField
        control={form.control}
        name={`deployers.${index}.deployerAddress`}
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

      {isVerifying && (
        <div className="flex items-center">
          <Loader2 width={16} height={16} />
          <p>Searching for contracts</p>
        </div>
      )}

      {errorMessage && errorMessage}
      <div className="flex justify-between items-end">
        <Button
          variant="destructive"
          type="button"
          disabled={!isValidAddress}
          onClick={handleOnClick}
        >
          {errorMessage ? "Retry" : "Verify"}
        </Button>
      </div>
    </>
  )
}
