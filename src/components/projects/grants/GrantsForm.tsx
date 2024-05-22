"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Prisma } from "@prisma/client"
import { format, toDate } from "date-fns-tz"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { setProjectFunding } from "@/lib/actions/projects"
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
} from "./schema"

function toFormValues(
  project: ProjectWithDetails,
): z.infer<typeof FundingFormSchema> {
  const venture: z.infer<typeof FundingFormSchema>["venture"] = []
  const grants: z.infer<typeof FundingFormSchema>["grants"] = []
  const revenue: z.infer<typeof FundingFormSchema>["revenue"] = []

  project.funding.forEach((funding) => {
    if (funding.type === "venture") {
      venture.push({
        amount: funding.amount,
        year: funding.receivedAt,
        details: funding.details ?? "",
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
    } else if (funding.type === "revenue") {
      revenue.push({
        amount: funding.amount,
        details: funding.details ?? undefined,
      })
    }
  })

  return {
    venture,
    grants,
    revenue,
  }
}

function fromFormValues(
  projectId: string,
  values: z.infer<typeof FundingFormSchema>,
): Prisma.ProjectFundingCreateManyInput[] {
  const funding: Prisma.ProjectFundingCreateManyInput[] = []

  values.venture.forEach((venture) => {
    funding.push({
      type: "venture",
      amount: venture.amount,
      receivedAt: venture.year,
      details: venture.details,
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

  values.revenue.forEach((revenue) => {
    funding.push({
      type: "revenue",
      amount: revenue.amount,
      details: revenue.details,
      receivedAt: "",
      projectId,
    })
  })

  return funding
}

export const GrantsForm = ({ project }: { project: ProjectWithDetails }) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    fields: ventureFields,
    replace: setVentureFields,
    append: addVentureField,
    remove: removeVentureField,
  } = useFieldArray({
    control: form.control,
    name: "venture",
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
    fields: revenueFields,
    replace: setRevenueFields,
    append: addRevenueField,
    remove: removeRevenueField,
  } = useFieldArray({
    control: form.control,
    name: "revenue",
  })

  const hasFundingType = (type: FundingType) => {
    switch (type) {
      case "venture":
        return ventureFields.length > 0
      case "grants":
        return grantsFields.length > 0
      case "revenue":
        return revenueFields.length > 0
      case "none":
        return selectedNone
      default:
        return false
    }
  }

  const onToggleFundingType = (type: FundingType) => {
    if (type === "venture") {
      if (ventureFields.length === 0) {
        setSelectedNone(false)
        addVentureField({
          amount: "",
          year: "",
          details: "",
        })
      } else {
        setVentureFields([])
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
    } else if (type === "revenue") {
      if (revenueFields.length === 0) {
        setSelectedNone(false)
        addRevenueField({
          amount: "",
          details: "",
        })
      } else {
        setRevenueFields([])
      }
    } else if (type === "none") {
      setVentureFields([])
      setGrantsFields([])
      setRevenueFields([])
      setSelectedNone(!selectedNone)
    }
  }

  const onAddFundingType = async (type: FundingType) => {
    if (type === "venture") {
      const valid = await form.trigger("venture")
      if (valid) {
        addVentureField({
          amount: "",
          year: "",
          details: "",
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
    } else if (type === "revenue") {
      const valid = await form.trigger("revenue")
      if (valid) {
        addRevenueField({
          amount: "",
          details: "",
        })
      }
    }
  }

  const onSubmit = async (values: z.infer<typeof FundingFormSchema>) => {
    setIsSubmitting(true)
    await setProjectFunding(project.id, fromFormValues(project.id, values))

    router.push(`/projects/${project.id}/publish`)
  }

  const canSubmit =
    selectedNone ||
    ventureFields.length > 0 ||
    grantsFields.length > 0 ||
    revenueFields.length > 0

  return (
    <div className="flex flex-col gap-y-12 w-full">
      <div className="flex flex-col gap-y-6">
        <h2 className="text-2xl font-semibold">Grants & Funding</h2>
        <p className="text-secondary-foreground">
          List any grants, funding, or revenue your project has received. This
          does not include past rounds of Retro Funding.
        </p>
        <div className="flex flex-col gap-y-1.5">
          <p className="text-sm font-medium">
            What kinds of funding have you received since Jan 2023?
            <span className="text-destructive">*</span>
          </p>
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-12"
        >
          {grantsFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Grants</h3>
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
                className="w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add grant
              </Button>
            </div>
          ) : null}
          {ventureFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Venture Funding</h3>
              {ventureFields.map((field, index) => (
                <VentureFundingForm
                  key={field.id}
                  form={form}
                  index={index}
                  remove={() => removeVentureField(index)}
                />
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("venture")}
                className="w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add venture capital
              </Button>
            </div>
          ) : null}
          {revenueFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Revenue</h3>
              {revenueFields.map((field, index) => (
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
                onClick={() => onAddFundingType("revenue")}
                className="w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add grant
              </Button>
            </div>
          ) : null}

          <Button
            isLoading={isSubmitting}
            disabled={!canSubmit || isSubmitting}
            variant="destructive"
            className="w-fit"
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
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
        className="mt-0.5 rounded-none border-[1.5px]"
      />
      <div className="flex flex-col">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
