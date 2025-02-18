"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
import { updateProjectOSOStatus } from "@/lib/actions/contracts"
import { updateProjectDetails } from "@/lib/actions/projects"
import { ProjectContracts } from "@/lib/types"
import { groupByDeployer } from "@/lib/utils/contractForm"

import {
  DeployersSchema,
  formatDefillamaSlug,
  reverseFormatDefillamaSlug,
} from "./ContractFormSchema"
import { DefiLlamaFormFiled } from "./DefiLlamaFormFiled"
import { DeployersFormField } from "./DeployersFormField"

function getDefaultValues(
  projectContracts: ProjectContracts,
): z.infer<typeof DeployersSchema> {
  const projectContractsByDeployer = Object.values(
    groupByDeployer(projectContracts.contracts),
  )

  return {
    submittedToOSO: projectContracts.isSubmittedToOso,
    isOffChain: !projectContracts.isOnChainContract,
    osoSlug: projectContracts.openSourceObserverSlug ?? "",
    deployers:
      projectContractsByDeployer.length > 0
        ? projectContractsByDeployer.map((deployer) => ({
            address: deployer.address,
            contracts: deployer.contracts.map((contract) => ({
              address: contract.address,
              chainId: contract.chainId.toString(),
              excluded: false,
            })),
            signature: projectContracts.contracts[0]?.verificationProof ?? "",
            verificationChainId:
              projectContracts.contracts[0]?.verificationChainId?.toString() ??
              "",
          }))
        : [
            {
              address: "",
              contracts: [],
              signature: "",
              verificationChainId: "",
            },
          ],
    defillamaSlug:
      projectContracts.defiLlamaSlug.length === 0
        ? [{ slug: "" }]
        : projectContracts.defiLlamaSlug.map((slug) => ({
            slug: reverseFormatDefillamaSlug(slug),
          })),
  }
}

export function ContractsForm({ project }: { project: ProjectContracts }) {
  const form = useForm<z.infer<typeof DeployersSchema>>({
    resolver: zodResolver(DeployersSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: getDefaultValues(project),
    criteriaMode: "all",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()

  const {
    fields: defillamaSlugFields,
    append: addDefillamaSlugField,
    remove: removeDefillamaSlugField,
  } = useFieldArray({
    control: form.control,
    name: "defillamaSlug",
  })

  const onAddDefillamaSlugField = async () => {
    const valid = form.getValues("defillamaSlug").every((slug) => slug)
    if (valid) {
      addDefillamaSlugField({ slug: "" })
    }
  }

  const onRemoveDefillamaSlugField = async (index: number) => {
    try {
      const isOnlyRepo = defillamaSlugFields.length === 1
      removeDefillamaSlugField(index)

      if (isOnlyRepo) {
        addDefillamaSlugField({ slug: "" })
      }
    } catch (error) {
      console.error("Error removing defillama url", error)
    }
  }

  const onSubmit =
    (isSave: boolean) => async (values: z.infer<typeof DeployersSchema>) => {
      isSave ? setIsSaving(true) : setIsSubmitting(true)

      toast.info("Saving project...")
      try {
        const [result] = await Promise.all([
          updateProjectOSOStatus({
            projectId: project.id,
            osoProjectName: values.osoSlug,
            isSubmittedToOso: values.submittedToOSO,
          }),
          updateProjectDetails(project.id, {
            isOnChainContract: !values.isOffChain,
            defiLlamaSlug: values.defillamaSlug
              .filter((slug) => slug.slug)
              .map((slug) => formatDefillamaSlug(slug.slug)),
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

  const isOffchain = form.watch("isOffChain")
  const submittedToOso = form.watch("submittedToOSO")
  const deployers = form.watch("deployers")

  const canAddContract = deployers.every(
    (deployer) => deployer.contracts.length > 1,
  )

  const canSubmit = (function () {
    return (
      isOffchain ||
      canAddContract ||
      submittedToOso ||
      deployers.some((d) => d.contracts.length > 0)
    )
  })()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit(false))}>
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl">Contracts</h3>
          <div className="text-secondary-foreground">
            {"Add your project's onchain contracts and verify ownership."}
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

        <DeployersFormField form={form} />

        <div className="flex flex-col gap-6 mt-10">
          <h3 className="text-text-default">Additional Data</h3>

          <p className="mt-2 text-base font-normal text-secondary-foreground text-sm">
            <p className="text-sm font-medium">DefiLlama adapter</p>
            For Defi projects, include a link to your{" "}
            <ExternalLink className="underline" href={"https://defillama.com/"}>
              DefiLlama adapter
            </ExternalLink>
            .
          </p>
          {defillamaSlugFields.map((field, index) => (
            <DefiLlamaFormFiled
              key={field.id}
              form={form}
              index={index}
              onRemove={onRemoveDefillamaSlugField}
            />
          ))}
          <Tooltip>
            <TooltipTrigger type="button" className="w-fit">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  !form.getValues("defillamaSlug").every((slug) => slug.slug)
                }
                onClick={onAddDefillamaSlugField}
                className="mt-4 w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add another DefiLlama
                adapter
              </Button>
            </TooltipTrigger>
            {!form.getValues("defillamaSlug").every((slug) => slug) && (
              <TooltipContent>
                <p className="text-sm">First add one, then you can add more</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        <div className="flex flex-col gap-6 mt-10">
          <h3 className="text-text-default">
            Add this project to Open Source Observer
          </h3>
          <div className="text-text-secondary font-normal">
            It is highly encouraged that projects verify contracts onchain.
            However, if you&apos;ve lost your deployer keys, you can complete
            this step by{" "}
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
                        <Input placeholder="Add a name" {...field} />
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
                      This project has been submitted to Open Source Observer
                    </FormLabel>
                  </FormItem>
                </FormItem>
              </>
            )}
          />
        </div>
        <div className="flex gap-2 mt-10">
          <Button
            isLoading={isSaving}
            disabled={!canSubmit || isSubmitting || !form.formState.isDirty}
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
  )
}
