"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Prisma } from "@prisma/client"
import { format, toDate } from "date-fns-tz"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { setProjectFunding, updateProjectDetails } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

import {
  GrantsFundingForm,
  RevenueFundingForm,
  VentureFundingForm,
} from "./FundingForm"
import {
  FUNDING_TYPES,
  FundingFormSchema,
  FundingType,
  OptimismGrantSchema,
  OtherGrantSchema,
  PRICING_MODEL_TYPES,
  PRICINGMODELTYPES,
} from "./schema"

function toFormValues(
  project: ProjectWithDetails,
): z.infer<typeof FundingFormSchema> {
  const retroFunding: z.infer<typeof FundingFormSchema>["retroFunding"] = []
  const grants: z.infer<typeof FundingFormSchema>["grants"] = []
  const investment: z.infer<typeof FundingFormSchema>["investment"] = []

  project.funding.forEach((funding) => {
    if (funding.type === "retroFunding") {
      retroFunding.push({
        amount: funding.amount,
        fundingRound: funding.fundingRound ?? "",
      })
    } else if (funding.type === "other-grant") {
      grants.push({
        type: "other-grant",
        name: funding.grant ?? "",
        amount: funding.amount,
        year: funding.receivedAt,
        details: funding.details ?? "",
      })
    } else if (funding.grant) {
      grants.push({
        // @ts-ignore TODO: coerce to correct type here
        type: funding.grant,
        link: funding.grantUrl ?? "",
        amount: funding.amount,
        date: format(toDate(funding.receivedAt), "yyyy-MM-dd"), // date-fns does really stupid timezone conversions by default...
        details: funding.details ?? "",
      })
    } else if (funding.type === "venture") {
      investment.push({
        amount: funding.amount,
        details: funding.details ?? undefined,
        year: funding.receivedAt,
      })
    }
  })

  return {
    retroFunding,
    grants,
    investment,
    pricingModel: project.pricingModel ?? "",
    pricingModelDetail: project.pricingModelDetails ?? "",
  }
}

function fromFormValues(
  projectId: string,
  values: z.infer<typeof FundingFormSchema>,
): Prisma.ProjectFundingCreateManyInput[] {
  const funding: Prisma.ProjectFundingCreateManyInput[] = []

  values.retroFunding.forEach((retroFunding) => {
    funding.push({
      type: "retroFunding",
      amount: retroFunding.amount,
      receivedAt: "",
      fundingRound: retroFunding.fundingRound,
      projectId,
    })
  })

  const optimismGrants = values.grants.filter(
    (grant) => grant.type !== "other-grant",
  ) as z.infer<typeof OptimismGrantSchema>[]

  optimismGrants.forEach((optimism) => {
    if (!optimism.type) return

    funding.push({
      type: optimism.type,
      amount: optimism.amount.toString(),
      receivedAt: optimism.date,
      grant: optimism.type,
      grantUrl: optimism.link,
      details: optimism.details,
      projectId,
    })
  })

  const otherGrants = values.grants.filter(
    (grant) => grant.type === "other-grant",
  ) as z.infer<typeof OtherGrantSchema>[]

  otherGrants.forEach((other) => {
    funding.push({
      type: other.type,
      grant: other.name,
      amount: other.amount,
      receivedAt: other.year,
      details: other.details,
      projectId,
    })
  })

  values.investment.forEach((investment) => {
    funding.push({
      type: "venture",
      amount: investment.amount,
      details: investment.details,
      receivedAt: investment.year,
      projectId,
    })
  })

  return funding
}

export const GrantsForm = ({ project }: { project: ProjectWithDetails }) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof FundingFormSchema>>({
    resolver: zodResolver(FundingFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: toFormValues(project),
  })

  const [selectedNone, setSelectedNone] = useState(
    project.funding.length === 0 && project.addedFunding,
  )

  const {
    fields: retroFundingFields,
    replace: setRetroFunding,
    append: addRetroFunding,
    remove: removeRetroFunding,
  } = useFieldArray({
    control: form.control,
    name: "retroFunding",
  })

  const {
    fields: grantsFields,
    replace: setGrantsFields,
    append: addGrantsField,
    remove: removeGrantsField,
  } = useFieldArray({
    control: form.control,
    name: "grants",
  })

  const {
    fields: investmentFields,
    replace: setRevenueFields,
    append: addRevenueField,
    remove: removeRevenueField,
  } = useFieldArray({
    control: form.control,
    name: "investment",
  })

  const hasFundingType = (type: FundingType) => {
    switch (type) {
      case "retroFunding":
        return retroFundingFields.length > 0
      case "grants":
        return grantsFields.length > 0
      case "revenue":
        return investmentFields.length > 0
      case "none":
        return selectedNone
      default:
        return false
    }
  }

  const onToggleFundingType = (type: FundingType) => {
    if (type === "retroFunding") {
      if (retroFundingFields.length === 0) {
        setSelectedNone(false)
        addRetroFunding({
          amount: "",
          fundingRound: "",
        })
      } else {
        setRetroFunding([])
      }
    } else if (type === "grants") {
      if (grantsFields.length === 0) {
        setSelectedNone(false)
        addGrantsField({
          type: undefined,
          link: "",
          amount: "",
          date: "",
          details: "",
        })
      } else {
        setGrantsFields([])
      }
    } else if (type === "venture") {
      if (investmentFields.length === 0) {
        setSelectedNone(false)
        addRevenueField({
          amount: "",
          details: "",
          year: "",
        })
      } else {
        setRevenueFields([])
      }
    } else if (type === "none") {
      setRetroFunding([])
      setGrantsFields([])
      setRevenueFields([])
      setSelectedNone(!selectedNone)
    }
  }

  const onAddFundingType = async (type: FundingType) => {
    if (type === "retroFunding") {
      const valid = await form.trigger("retroFunding")
      if (valid) {
        addRetroFunding({
          amount: "",
          fundingRound: "",
        })
      }
    } else if (type === "grants") {
      const valid = await form.trigger("grants")
      if (valid) {
        addGrantsField({
          type: undefined,
          link: "",
          amount: "",
          date: "",
          details: "",
        })
      }
    } else if (type === "venture") {
      const valid = await form.trigger("investment")
      if (valid) {
        addRevenueField({
          amount: "",
          details: "",
          year: "",
        })
      }
    }
  }

  const onSubmit =
    (isSave: boolean) => async (values: z.infer<typeof FundingFormSchema>) => {
      isSave ? setIsSaving(true) : setIsSubmitting(true)
      try {
        await setProjectFunding(project.id, fromFormValues(project.id, values))
        await updateProjectDetails(project.id, {
          pricingModel: values.pricingModel,
          pricingModelDetails: values.pricingModelDetail,
        })

        !isSave && router.push(`/projects/${project.id}/publish`)
        toast.success("Saved.")
        setIsSaving(false)
      } catch (error) {
        toast.error("There was an error saving your changes.")
        isSave ? setIsSaving(false) : setIsSubmitting(false)
      }
    }

  const pricingModel = form.watch("pricingModel")

  const canSubmit =
    (selectedNone ||
      retroFundingFields.length > 0 ||
      grantsFields.length > 0 ||
      investmentFields.length > 0) &&
    pricingModel

  console.log(retroFundingFields, grantsFields, investmentFields, "data")

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit(false))}
        className="flex flex-col gap-y-12 w-full"
      >
        <div className="flex flex-col gap-y-6">
          <h2 className="text-2xl font-semibold text-text-default">
            Pricing, grants, and investment
          </h2>
          <p className="text-text-secondary">
            Describe your pricing model, and list any Optimism Grants, Optimism
            Retro Funding, or investment your project has received.
          </p>
          <Callout
            type="info"
            text="Failure to report will result in disqualification from Retro Funding"
          />
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-medium text-foreground">
              Which best describes your project’s pricing model?
              <span className="text-destructive">*</span>
            </p>

            <FormField
              control={form.control}
              name="pricingModel"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {PRICING_MODEL_TYPES.map((PRICINGMODELTYPES) => (
                    <PricingModelTypeOption
                      {...PRICINGMODELTYPES}
                      key={PRICINGMODELTYPES.type}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <div>
              <p className="text-sm font-medium text-foreground">
                What kinds of grants and investment have you received?
                <span className="text-destructive">*</span>
              </p>
              <p className="text-sm font-normal text-secondary-foreground">
                Select all that apply.
              </p>
            </div>

            {FUNDING_TYPES.map((fundingType) => (
              <FundingTypeOption
                {...fundingType}
                key={fundingType.type}
                isSelected={hasFundingType(fundingType.type)}
                onSelect={onToggleFundingType}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-12">
          {pricingModel && pricingModel !== "free" && (
            <div className="flex flex-col gap-y-6 ">
              <p className="text-lg font-semibold text-text-default">Pricing</p>
              <div className="flex flex-col gap-y-6 p-6 border rounded-xl">
                <FormField
                  control={form.control}
                  name="pricingModelDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal text-foreground">
                        Please provide details about your pricing model and how
                        much it costs to use your product
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add details "
                          className="resize-none mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {grantsFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold text-text-default">
                Optimism Grants (since Jan 2023)
              </h3>
              {grantsFields.map((field, index) => (
                <GrantsFundingForm
                  key={field.id}
                  form={form}
                  index={index}
                  remove={() => removeGrantsField(index)}
                />
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("grants")}
                className="w-fit text-sm font-medium text-foreground"
              >
                <Plus size={16} className="mr-2.5" /> Add Optimism Grant
              </Button>
            </div>
          ) : null}
          {retroFundingFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold text-text-default">
                Optimism Retro Funding
              </h3>
              {retroFundingFields.map((field, index) => (
                <VentureFundingForm
                  key={field.id}
                  form={form}
                  index={index}
                  remove={() => removeRetroFunding(index)}
                />
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("retroFunding")}
                className="w-fit text-sm font-medium text-foreground"
              >
                <Plus size={16} className="mr-2.5" /> Add Retro Funding
              </Button>
            </div>
          ) : null}
          {investmentFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold text-text-default">
                Investment (since Jan 2020)
              </h3>
              {investmentFields.map((field, index) => (
                <RevenueFundingForm
                  key={field.id}
                  form={form}
                  index={index}
                  remove={() => removeRevenueField(index)}
                />
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("venture")}
                className="w-fit text-sm font-medium text-foreground"
              >
                <Plus size={16} className="mr-2.5" /> Add investment
              </Button>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              isLoading={isSaving}
              disabled={!canSubmit || isSaving}
              type="button"
              onClick={form.handleSubmit(onSubmit(true))}
              variant="destructive"
              className="w-fit"
            >
              Save
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!canSubmit || isSubmitting}
              variant="secondary"
              className="w-fit"
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

const FundingTypeOption = ({
  className,
  type,
  label,
  description,
  isSelected,
  onSelect,
}: {
  className?: string
  type: FundingType
  label: string
  description?: string
  isSelected?: boolean
  onSelect: (type: FundingType) => void
}) => {
  return (
    <div className={cn("group flex gap-x-2 p-4 border rounded-xl", className)}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(type)}
        className="mt-0.5"
      />
      <div className="flex flex-col">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-secondary-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
const PricingModelTypeOption = ({
  className,
  type,
  label,
  description,
}: {
  className?: string
  type: PRICINGMODELTYPES
  label: string
  description?: string
}) => {
  return (
    <div className={cn("group flex gap-x-2 p-4 border rounded-xl", className)}>
      <RadioGroupItem value={type} id="r1" className="mt-0.5" />
      <div className="flex flex-col">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-secondary-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
