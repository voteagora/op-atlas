"use client"

import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { ProjectWithDetails } from "@/lib/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Chain, ContractsSchema, HasDeployerKeysOption } from "./schema"
import { ContractForm } from "./ContractForm"

const EMPTY_CONTRACT = {
  contractAddress: "",
  deploymentTxHash: "",
  deployerAddress: "",
  chain: Chain.Enum["OP Mainnet"],
}

export function ContractsForm({ project }: { project: ProjectWithDetails }) {
  const form = useForm<z.infer<typeof ContractsSchema>>({
    resolver: zodResolver(ContractsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      isOffChain: false,
      hasDeployerKeys: "Yes",
      contracts: [
        {
          ...EMPTY_CONTRACT,
        },
      ],
    },
  })

  const {
    fields: contractsFields,
    append: addContractsFields,
    remove: removeContractsFields,
  } = useFieldArray({
    control: form.control,
    name: "contracts",
  })

  const onSubmit = async (values: z.infer<typeof ContractsSchema>) => {
    console.log("Submitting:", values)
  }

  const formValues = useWatch({
    control: form.control,
  })

  const canSubmit = (function () {
    if (formValues.hasDeployerKeys === "No") {
      return !!formValues.submittedToOSO
    }

    if (formValues.hasDeployerKeys === "Yes") {
      return formValues.contracts && formValues.contracts.length > 0
    }

    return (
      !!formValues.submittedToOSO &&
      formValues.contracts &&
      formValues.contracts.length > 0
    )
  })()

  // can add a new contract once the previous one is verified
  const canAddContract =
    formValues.contracts.length < 1 ||
    Boolean(formValues.contracts[formValues.contracts.length - 1].signature)

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-12"
        >
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl">Contracts</h3>
            <div className="text-text-secondary">
              Add your project&apos;s contracts and verify ownership. Your
              contract&apos;s onchain metrics will help badgeholders make
              objective decisions during voting.
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="isOffChain"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="text-sm">
                      <FormLabel className="text-foreground">
                        This project isn&apos;t onchain
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {formValues.isOffChain ? (
                <div className="bg-red-200 p-4 gap-3 flex items-center rounded-xl text-destructive-foreground font-medium text-sm">
                  <Image
                    src="/assets/icons/info-red.svg"
                    width={16.5}
                    height={16.5}
                    alt="Information"
                  />
                  <div className="flex items-center flex-1 gap-6">
                    <div className="flex-1">
                      This project is not eligible for Retro Funding Round 4.
                      However, it may be eligible for future rounds. You can
                      continue to the next step.
                    </div>
                    <Link className="text-sm" href="#">
                      Learn more
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-accent p-4 gap-3 flex items-center rounded-xl text-accent-foreground font-medium text-sm">
                  <Image
                    src="/assets/icons/info-blue.svg"
                    width={16.5}
                    height={16.5}
                    alt="Information"
                  />
                  <div className="flex-1">
                    Projects must be onchain for Retro Funding Round 4
                  </div>
                  <Link className="text-sm" href="#">
                    Learn more
                  </Link>
                </div>
              )}
            </div>
          </div>

          {!formValues.isOffChain && (
            <>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3>Deployer keys</h3>
                  <div className="text-text-secondary">
                    To verify ownership, you&apos;ll need your deployer keys for
                    each contract. This includes contract address, deployment tx
                    hash, and deployer address.
                  </div>
                  <FormField
                    control={form.control}
                    name="hasDeployerKeys"
                    render={({ field }) => (
                      <FormItem className="gap-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid md:grid-cols-3 grid-cols-1 gap-2"
                          >
                            {HasDeployerKeysOption.options.map((option) => (
                              <FormItem key={option}>
                                <FormLabel className="flex-1 min-w-6 basis-0 p-4 text-sm font-medium flex items-center gap-3 border rounded-sm text-foreground">
                                  <FormControl>
                                    <RadioGroupItem value={option} />
                                  </FormControl>
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {formValues.hasDeployerKeys !== "No" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h3>Onchain verification</h3>
                    <div className="text-text-secondary">
                      First verify one contract, then you&apos;ll be able to add
                      more. Additional contracts with the same deployer address
                      will be automatically verified.
                    </div>
                  </div>
                  {contractsFields.map((field, index) => (
                    <ContractForm
                      remove={() => removeContractsFields(index)}
                      key={field.id}
                      form={form}
                      index={index}
                    />
                  ))}
                  {canAddContract && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addContractsFields({ ...EMPTY_CONTRACT })}
                      className="w-fit"
                    >
                      <Plus size={16} className="mr-2.5" /> Add contract
                    </Button>
                  )}
                </div>
              )}

              {formValues.hasDeployerKeys !== "Yes" && (
                <div className="flex flex-col gap-6">
                  <h3>Add this project to Open Source Observer</h3>
                  <div className="text-text-secondary">
                    It is highly encouraged that projects verify contracts
                    onchain. However, if you&apos;ve lost your deployer keys,
                    you can complete this step by adding your project to{" "}
                    <span className="font-medium">Open Source Observer.</span>
                  </div>
                  <div className="text-text-secondary">
                    Follow{" "}
                    <Link className="font-medium" href="#">
                      these instructions
                    </Link>{" "}
                    for adding your project. Make sure that your project has
                    been added before the Retro Funding submission deadline.
                  </div>
                  <Button
                    className="p-0 self-start"
                    type="button"
                    variant="secondary"
                  >
                    <Link
                      className="flex items-center gap-2.5 w-full h-full py-2 px-3 font-medium"
                      href="#"
                    >
                      View instructions{" "}
                      <Image
                        src="/assets/icons/arrow-up-right.svg"
                        height={8}
                        width={8}
                        alt="Arrow up right"
                      />
                    </Link>
                  </Button>
                  <FormField
                    control={form.control}
                    name="submittedToOSO"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Confirmation</FormLabel>
                        <FormItem className="flex flex-row items-center gap-3 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm">
                            <FormLabel className="font-normal text-sm">
                              This project has been submitted to Open Source
                              Observer
                            </FormLabel>
                          </div>
                        </FormItem>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </>
          )}

          <Button
            className="self-start"
            disabled={!canSubmit}
            type="submit"
            variant="destructive"
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  )
}
