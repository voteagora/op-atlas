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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  removeContract,
  updateContractDetails,
  updateProjectOSOStatus,
} from "@/lib/actions/contracts"
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
  name: "",
  description: "",
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
    name: contract.name ?? "",
    description: contract.description ?? "",
  }
}

function getDefaultValues(
  project?: ProjectWithDetails,
): z.infer<typeof ContractsSchema> {
  if (!project) {
    return {
      isOffChain: false,

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

  return {
    isOffChain: project.isOnChainContract === false,
    contracts: contracts.length > 0 ? contracts : [{ ...EMPTY_CONTRACT }],
    submittedToOSO: project.isSubmittedToOso,
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
            isSubmittedToOso: values.submittedToOSO,
          }),
          updateProjectDetails(project.id, {
            isOnChainContract: !values.isOffChain,
          }),
          !values.isOffChain &&
            values.contracts[0].length > 0 &&
            updateContractDetails({
              projectId: project.id,
              contractAddress: values.contracts[0].contractAddress,
              chainId: parseInt(values.contracts[0].chain),
              name: values.contracts[0].name,
              description: values.contracts[0].description,
            }),
        ])

        if (result.error) {
          throw new Error(result.error)
        }

        !isSave && router.push(`/projects/${project.id}/grants`)
        setIsSaving(false)
        toast.success("Project saved")
      } catch (error) {
        toast.error("There was an error saving the project.")
        isSave ? setIsSaving(false) : setIsSubmitting(false)
      }
    }

  const formValues = useWatch({
    control: form.control,
  })

  // can add a new contract once the previous one is verified
  const canAddContract =
    formValues.contracts.length < 1 ||
    Boolean(formValues.contracts[formValues.contracts.length - 1].signature)

  const canSubmit = (function () {
    return (
      formValues.isOffChain || canAddContract || form.getValues().submittedToOSO
    )
  })()

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
                  <FormItem className="flex items-center space-x-2 border border-input p-3 h-10 rounded-lg w-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className=" text-sm font-normal text-foreground">
                      {"This project isn't onchain"}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {
            <FormField
              control={form.control}
              name="isOffChain"
              render={({ field }) => {
                return (
                  <>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-default">
                          Verified contracts
                        </h3>
                        <p className="text-base text-secondary-foreground">
                          First verify one contract, then you’ll be able to add
                          more. Additional contracts with the same deployer
                          address will be automatically verified.
                        </p>
                        <p className="text-base text-secondary-foreground">
                          There’s no need to verify contracts that were deployed
                          by a verified deployer (e.g. if you deployed a factory
                          contract), as we’ll pick those up automatically.
                        </p>
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

                      <Tooltip>
                        <TooltipTrigger type="button" className="w-fit">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={!canAddContract}
                            onClick={() =>
                              addContractsFields({ ...EMPTY_CONTRACT })
                            }
                            className="w-fit"
                          >
                            <Plus size={16} className="mr-2.5" /> Add another
                            contract
                          </Button>
                        </TooltipTrigger>
                        {!canAddContract && (
                          <TooltipContent>
                            <p className="text-sm">
                              First add one, then you can add more
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>

                    <div className="flex flex-col gap-6">
                      <h3 className="text-text-default">
                        Add this project to Open Source Observer
                      </h3>
                      <div className="text-text-secondary font-normal">
                        It is highly encouraged that projects verify contracts
                        onchain. However, if you’ve lost your deployer keys, you
                        can complete this step by{" "}
                        <ExternalLink
                          href="https://www.opensource.observer"
                          className="underline"
                        >
                          adding your project to Open Source Observer.
                        </ExternalLink>
                      </div>

                      <FormField
                        control={form.control}
                        name="submittedToOSO"
                        render={({ field }) => (
                          <>
                            {
                              <FormField
                                control={form.control}
                                name="osoSlug"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-foreground">
                                      Your Open Source Observer name
                                    </FormLabel>
                                    <Input
                                      placeholder="Add a name"
                                      {...field}
                                    />
                                  </FormItem>
                                )}
                              />
                            }

                            <FormItem className="flex flex-col gap-2">
                              <FormLabel className="text-foreground">
                                Confirmation{" "}
                              </FormLabel>
                              <FormItem className="flex flex-row items-center gap-2 py-3 px-4 rounded-lg border">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm text-secondary-foreground">
                                  This project has been submitted to Open Source
                                  Observer
                                </FormLabel>
                              </FormItem>
                            </FormItem>
                          </>
                        )}
                      />
                    </div>
                  </>
                )
              }}
            />
          }

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
