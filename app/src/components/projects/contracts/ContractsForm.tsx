"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateProjectOSOStatus } from "@/lib/actions/contracts"
import { updateProjectDetails } from "@/lib/actions/projects"
import { ProjectContracts } from "@/lib/types"
import { groupByDeployer } from "@/lib/utils/contractForm"

import { DeployersFormField } from "./DeployersFormField"
import { DeployersSchema } from "./ContractFormSchema"

function formatDefillamaSlug(slug: string) {
  if (slug.startsWith("https://defillama.com/protocol/")) {
    return slug.replace("https://defillama.com/protocol/", "")
  }
  return slug
}

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
    deployers: projectContractsByDeployer.map((deployer) => ({
      address: deployer.address,
      contracts: deployer.contracts.map((contract) => ({
        address: contract.address,
        chainId: contract.chainId.toString(),
        excluded: false,
      })),
      signature: projectContracts.contracts[0]?.verificationProof ?? "",
    })),
    defillamaSlug: projectContracts.defiLlamaSlug[0] ?? "",
  }
}

export function ContractsForm({ project }: { project: ProjectContracts }) {
  const form3 = useForm<z.infer<typeof DeployersSchema>>({
    resolver: zodResolver(DeployersSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: getDefaultValues(project),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()

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
            defiLlamaSlug: [values.defillamaSlug],
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

  const isOffchain = form3.watch("isOffChain")
  const submittedToOso = form3.watch("submittedToOSO")
  const deployers = form3.watch("deployers")

  const canAddContract = deployers.every(
    (deployer) => deployer.contracts.length > 1,
  )

  const canSubmit = (function () {
    return isOffchain || canAddContract || submittedToOso
  })()

  return (
    <Form {...form3}>
      <form onSubmit={form3.handleSubmit(onSubmit(false))}>
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl">Contracts</h3>
          <div className="text-secondary-foreground">
            {"Add your project's onchain contracts and verify ownership."}
          </div>
          <div className="flex flex-col gap-2">
            <FormField
              control={form3.control}
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

        <DeployersFormField form={form3} />

        <div className="flex flex-col gap-6 mt-10">
          <h3 className="text-text-default">Additional Data</h3>

          <FormField
            control={form3.control}
            name="defillamaSlug"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-foreground">
                  DefiLlama adapter
                </FormLabel>
                <FormDescription>
                  For Defi projects, include a link to your{" "}
                  <ExternalLink
                    className="underline"
                    href={"https://defillama.com/"}
                  >
                    DefiLlama adapter
                  </ExternalLink>
                  .
                </FormDescription>
                <Input
                  placeholder="https://defillama.com/protocol/..."
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.startsWith("https://defillama.com/protocol/")) {
                      field.onChange(formatDefillamaSlug(value))
                    } else {
                      field.onChange(value)
                    }
                  }}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-6 mt-10">
          <h3 className="text-text-default">
            Add this project to Open Source Observer
          </h3>
          <div className="text-text-secondary font-normal">
            It is highly encouraged that projects verify contracts onchain.
            However, if you’ve lost your deployer keys, you can complete this
            step by{" "}
            <ExternalLink
              href="https://www.opensource.observer"
              className="underline"
            >
              adding your project to Open Source Observer.
            </ExternalLink>
          </div>

          <FormField
            control={form3.control}
            name="submittedToOSO"
            render={({ field }) => (
              <>
                {
                  <FormField
                    control={form3.control}
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
            disabled={!canSubmit || isSubmitting}
            type="button"
            onClick={form3.handleSubmit(onSubmit(true))}
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
