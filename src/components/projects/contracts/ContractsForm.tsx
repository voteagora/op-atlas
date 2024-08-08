"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectContract } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { removeContract, updateProjectOSOStatus } from "@/lib/actions/contracts"
import { updateProjectDetails } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

import { ContractForm } from "./ContractForm"
import {
  Chain,
  ContractSchema,
  ContractsSchema,
  HasDeployerKeysOption,
} from "./schema"

const EMPTY_CONTRACT = {
  contractAddress: "",
  deploymentTxHash: "",
  deployerAddress: "",
  chain: Chain.options[0],
} satisfies z.infer<typeof ContractSchema>

function toFormValues(
  contract: ProjectContract,
): z.infer<typeof ContractSchema> {
  return {
    contractAddress: contract.contractAddress,
    deploymentTxHash: contract.deploymentHash,
    deployerAddress: contract.deployerAddress,
    chain: contract.chainId.toString(),
    signature: contract.verificationProof,
  }
}

function getDefaultValues(
  project?: ProjectWithDetails,
): z.infer<typeof ContractsSchema> {
  if (!project) {
    return {
      isOffChain: false,
      hasDeployerKeys: "Yes" as const,
      submittedToOSO: false,
      osoSlug: "",
      contracts: [
        {
          ...EMPTY_CONTRACT,
        },
      ],
    }
  }

  const contracts = project.contracts.map(toFormValues)
  let hasDeployerKeys = project.openSourceObserverSlug ? "No" : "Yes"
  if (contracts.length > 0) {
    hasDeployerKeys = project.openSourceObserverSlug
      ? "Some, but not all"
      : "Yes"
  }

  return {
    isOffChain: project.isOnChainContract === false,
    hasDeployerKeys: hasDeployerKeys as "Yes" | "Some, but not all",
    contracts: contracts.length > 0 ? contracts : [{ ...EMPTY_CONTRACT }],
    submittedToOSO: !!project.openSourceObserverSlug,
    osoSlug: project.openSourceObserverSlug ?? "",
  }
}

export function ContractsForm({ project }: { project: ProjectWithDetails }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof ContractsSchema>>({
    resolver: zodResolver(ContractsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: getDefaultValues(project),
  })

  const {
    fields: contractsFields,
    append: addContractsFields,
    remove: removeContractsFields,
  } = useFieldArray({
    control: form.control,
    name: "contracts",
  })

  // Locally, this runs twice because of strict mode but dw about it
  useEffect(() => {
    toast.info("We recommend asking your developer to complete this step")
  }, [])

  const onRemoveContract = async (index: number) => {
    try {
      const isOnlyContract = contractsFields.length === 1
      const contract = form.getValues(`contracts.${index}`)

      await removeContract({
        projectId: project.id,
        address: contract.contractAddress,
        chainId: parseInt(contract.chain),
      })

      removeContractsFields(index)

      if (isOnlyContract) {
        addContractsFields({ ...EMPTY_CONTRACT })
      }
    } catch (error) {
      console.error("Error removing repo", error)
    }
  }

  const onSubmit =
    (isSave: boolean) => async (values: z.infer<typeof ContractsSchema>) => {
      isSave ? setIsSaving(true) : setIsSubmitting(true)

      try {
        const [result] = await Promise.all([
          updateProjectOSOStatus({
            projectId: project.id,
            osoProjectName: values.osoSlug,
          }),
          updateProjectDetails(
            project.id,
            {
              isOnChainContract: !values.isOffChain,
            },
            project.organization?.organizationId,
          ),
        ])

        if (result.error) {
          throw new Error(result.error)
        }

        !isSave && router.push(`/projects/${project.id}/grants`)
        setIsSaving(false)
        toast.success("Project saved")
      } catch (error) {
        toast.error("There was an error updating project OSO status.")
        isSave ? setIsSaving(false) : setIsSubmitting(false)
      }
    }

  const formValues = useWatch({
    control: form.control,
  })

  const canSubmit = (function () {
    if (formValues.hasDeployerKeys === "No") {
      return !!formValues.submittedToOSO && !!formValues.osoSlug
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
          onSubmit={form.handleSubmit(onSubmit(false))}
          className="flex flex-col gap-12"
        >
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl">Contracts</h3>
            <div className="text-secondary-foreground">
              Add your project&apos;s contracts and verify ownership. Your
              contract&apos;s onchain metrics will help badgeholders make
              objective decisions during voting.
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="isOffChain"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 border border-input p-4 rounded-lg w-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-black border-2 rounded-[2px]"
                      />
                    </FormControl>
                    <FormLabel className="text-foreground">
                      This project isn&apos;t onchain
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Callout
                type={formValues.isOffChain ? "error" : "info"}
                text={
                  formValues.isOffChain
                    ? "This project is not eligible for Retro Funding Round 4. However, it may be eligible for future rounds. You can continue to the next step."
                    : "Projects must be onchain for Retro Funding Round 4"
                }
              />
            </div>
          </div>

          {!formValues.isOffChain && (
            <>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3>Deployer keys</h3>
                  <div className="text-secondary-foreground">
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
                                <FormLabel className="flex-1 min-w-6 basis-0 p-4 text-sm font-medium flex items-center gap-3 border rounded-lg text-foreground cursor-pointer">
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
                    <div className="text-secondary-foreground">
                      First verify one contract, then you&apos;ll be able to add
                      more. Additional contracts with the same deployer address
                      will be automatically verified. If you have factory
                      contracts, you only need to verify that deployer.
                    </div>
                  </div>
                  {contractsFields.map((field, index) => (
                    <ContractForm
                      key={field.id}
                      form={form}
                      index={index}
                      projectId={project.id}
                      removeEmpty={() => removeContractsFields(index)}
                      removeVerified={() => onRemoveContract(index)}
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
                  <div className="text-secondary-foreground">
                    It is highly encouraged that projects verify contracts
                    onchain. However, if you&apos;ve lost your deployer keys,
                    you can complete this step by adding your project to{" "}
                    <ExternalLink
                      href="https://www.opensource.observer"
                      className="font-medium"
                    >
                      Open Source Observer.
                    </ExternalLink>
                  </div>
                  <div className="text-secondary-foreground">
                    Follow{" "}
                    <ExternalLink
                      href="https://docs.opensource.observer/docs/contribute/project-data"
                      className="font-medium"
                    >
                      these instructions
                    </ExternalLink>{" "}
                    for adding your project. Make sure that your project has
                    been added before the Retro Funding submission deadline.
                  </div>
                  <Button
                    className="p-0 self-start"
                    type="button"
                    variant="secondary"
                  >
                    <ExternalLink
                      className="flex items-center gap-2.5 w-full h-full py-2 px-3 font-medium"
                      href="https://docs.opensource.observer/docs/contribute/project-data"
                    >
                      View instructions{" "}
                      <Image
                        src="/assets/icons/arrow-up-right.svg"
                        height={8}
                        width={8}
                        alt="Arrow up right"
                      />
                    </ExternalLink>
                  </Button>

                  <FormField
                    control={form.control}
                    name="osoSlug"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>
                          Open Source Observer project name
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input placeholder="Add a name" {...field} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submittedToOSO"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>
                          Confirmation
                          <span className="ml-0.5 text-destructive">*</span>
                        </FormLabel>
                        <FormItem className="flex flex-row items-center gap-2 py-3 px-4 rounded-lg border">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-black border-[1.5px] rounded-[2px]"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            This project has been submitted to Open Source
                            Observer
                          </FormLabel>
                        </FormItem>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button
              isLoading={isSaving}
              disabled={!canSubmit || isSubmitting}
              type="button"
              onClick={form.handleSubmit(onSubmit(true))}
              variant="destructive"
            >
              Save
            </Button>
            <Button
              isLoading={isSubmitting}
              disabled={!canSubmit || isSubmitting}
              type="submit"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
