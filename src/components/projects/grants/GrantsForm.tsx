"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { FUNDING_TYPES, FundingFormSchema, FundingType } from "./schema"
import {
  OptimismFundingForm,
  OtherFundingForm,
  VentureFundingForm,
} from "./FundingForm"

export const GrantsForm = () => {
  const form = useForm<z.infer<typeof FundingFormSchema>>({
    resolver: zodResolver(FundingFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      venture: [],
      optimism: [],
      other: [],
    },
  })

  const [selectedNone, setSelectedNone] = useState(false)

  const {
    fields: ventureFields,
    replace: setVentureFields,
    append: addVentureField,
  } = useFieldArray({
    control: form.control,
    name: "venture",
  })

  const {
    fields: optimismFields,
    replace: setOptimismFields,
    append: addOptimismField,
  } = useFieldArray({
    control: form.control,
    name: "optimism",
  })

  const {
    fields: otherFields,
    replace: setOtherFields,
    append: addOtherField,
  } = useFieldArray({
    control: form.control,
    name: "other",
  })

  const hasFundingType = (type: FundingType) => {
    switch (type) {
      case "venture":
        return ventureFields.length > 0
      case "optimism":
        return optimismFields.length > 0
      case "other":
        return otherFields.length > 0
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
    } else if (type === "optimism") {
      if (optimismFields.length === 0) {
        setSelectedNone(false)
        addOptimismField({
          type: "",
          link: "",
          amount: "" as unknown as number, // We coerce it with zod, so this is a better empty UI
          date: "",
          details: "",
        })
      } else {
        setOptimismFields([])
      }
    } else if (type === "other") {
      if (otherFields.length === 0) {
        setSelectedNone(false)
        addOtherField({
          name: "",
          amount: "",
          year: "",
          details: "",
        })
      } else {
        setOtherFields([])
      }
    } else if (type === "none") {
      setVentureFields([])
      setOptimismFields([])
      setOtherFields([])
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
    } else if (type === "optimism") {
      const valid = await form.trigger("optimism")
      if (valid) {
        addOptimismField({
          type: "",
          link: "",
          amount: "" as unknown as number, // We coerce it with zod, so this is a better empty UI
          date: "",
          details: "",
        })
      }
    } else if (type === "other") {
      const valid = await form.trigger("other")
      if (valid) {
        addOtherField({
          name: "",
          amount: "",
          year: "",
          details: "",
        })
      }
    }
  }

  const onSubmit = (values: z.infer<typeof FundingFormSchema>) => {
    console.log("Submitting:", values)
  }

  const canSubmit =
    selectedNone ||
    ventureFields.length > 0 ||
    optimismFields.length > 0 ||
    otherFields.length > 0

  return (
    <div className="flex flex-col gap-y-12 w-full">
      <div className="flex flex-col gap-y-6">
        <h2 className="text-2xl font-semibold">Grants & Funding</h2>
        <p className="text-muted-foreground">
          List any funding your project has received. This does not include past
          rounds of Retro Funding.
        </p>
        <div className="flex flex-col gap-y-1.5">
          <p className="text-sm font-medium">
            What kind of funding have you received?
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
          {ventureFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Venture Funding</h3>
              {ventureFields.map((field, index) => (
                <VentureFundingForm key={field.id} form={form} index={index} />
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
          {optimismFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Optimism Grants</h3>
              {optimismFields.map((field, index) => (
                <OptimismFundingForm key={field.id} form={form} index={index} />
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("optimism")}
                className="w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add grant
              </Button>
            </div>
          ) : null}
          {otherFields.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-lg font-semibold">Other Grants</h3>
              {otherFields.map((field, index) => (
                <OtherFundingForm key={field.id} form={form} index={index} />
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddFundingType("other")}
                className="w-fit"
              >
                <Plus size={16} className="mr-2.5" /> Add grant
              </Button>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            variant="secondary"
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
