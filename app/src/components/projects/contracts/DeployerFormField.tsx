import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DeployersSchema } from "./schema3"
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsFormField } from "./ContractsFormField"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { isAddress } from "ethers"

export function DeployerFormField({
  form,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
}) {
  const [isVerifying, setIsVerifying] = useState(false)

  async function onVerify() {
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsVerifying(false)
  }

  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}`}
      render={({ field: deployer }) => (
        <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.address`}
            render={({ field: address }) => (
              <>
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel>Deployer Address</FormLabel>
                  <Input {...address} placeholder="Add a deployer address" />
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name={`deployers.${deployerIndex}.contracts`}
                  render={({ field: contracts }) => (
                    <>
                      {contracts.value.length > 0 ? (
                        <ContractsFormField
                          form={form}
                          deployerIndex={deployerIndex}
                        />
                      ) : (
                        <>
                          {isVerifying ? (
                            <div className="flex items-center">
                              <Loader2
                                width={16}
                                height={16}
                                className="animate-spin"
                              />
                              <p>Searching for contracts</p>
                            </div>
                          ) : (
                            <Button
                              disabled={!isAddress(address.value)}
                              variant={"destructive"}
                              className="w-20"
                              onClick={onVerify}
                            >
                              Verify
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                />
              </>
            )}
          />
        </div>
      )}
    />
  )
}
