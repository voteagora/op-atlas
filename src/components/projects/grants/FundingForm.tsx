import { X } from "lucide-react"
import Image from "next/image"
import { UseFormReturn, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { FundingFormSchema } from "./schema"

const FUNDING_AMOUNTS = [
  {
    label: "Less than $250K",
    value: "under-250k",
  },
  {
    label: "$250K - $500K",
    value: "250k-500k",
  },
  {
    label: "$500K - $1M",
    value: "500k-1m",
  },
  {
    label: "$1M - $3M",
    value: "1m-3m",
  },
  {
    label: "$3M - $5M",
    value: "3m-5m",
  },
  {
    label: "Greater than $5M",
    value: "above-5m",
  },
] as const

const FUNDING_YEARS = [
  {
    label: "2024",
    value: "2024",
  },
  {
    label: "2023",
    value: "2023",
  },
  {
    label: "2022",
    value: "2022",
  },
  {
    label: "2021",
    value: "2021",
  },
  {
    label: "2020",
    value: "2020",
  },
  {
    label: "Before 2020",
    value: "before-2020",
  },
] as const

export const RevenueFundingForm = ({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<z.infer<typeof FundingFormSchema>>
  index: number
  remove: () => void
}) => {
  return (
    <div className="group flex flex-col gap-y-6 p-6 border rounded-xl relative">
      <Button
        onClick={remove}
        className="hidden p-2 absolute top-1 right-1 group-hover:block"
        variant="ghost"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
      <FormField
        control={form.control}
        name={`revenue.${index}.amount`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              How much revenue have you earned since the start of 2023?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_AMOUNTS.map((amount) => (
                    <SelectItem key={amount.value} value={amount.value}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`revenue.${index}.details`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel>Details</FormLabel>
            <FormDescription className="!mt-0">
              Include any details you&apos;d like to about this funding.
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add a description"
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export const VentureFundingForm = ({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<z.infer<typeof FundingFormSchema>>
  index: number
  remove: () => void
}) => {
  return (
    <div className="group flex flex-col gap-y-6 p-6 border rounded-xl relative">
      <Button
        onClick={remove}
        className="hidden p-2 absolute top-1 right-1 group-hover:block"
        variant="ghost"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
      <FormField
        control={form.control}
        name={`venture.${index}.amount`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              How much funding did you receive?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_AMOUNTS.map((amount) => (
                    <SelectItem key={amount.value} value={amount.value}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`venture.${index}.year`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              When did you receive this funding?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`venture.${index}.details`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel>Details</FormLabel>
            <FormDescription className="!mt-0">
              Include any details you&apos;d like to about this funding.
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add a description"
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export const GrantsFundingForm = ({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<z.infer<typeof FundingFormSchema>>
  index: number
  remove: () => void
}) => {
  const formValues = useWatch({
    control: form.control,
  })

  const isOptimism =
    Boolean(formValues.grants?.[index].type) &&
    formValues.grants![index].type !== "other-grant"

  const isOther = formValues.grants?.[index].type === "other-grant"

  return (
    <div className="flex flex-col gap-y-6 p-6 border rounded-xl relative group">
      <Button
        onClick={remove}
        className="hidden p-2 absolute top-1 right-1 group-hover:block"
        variant="ghost"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
      <FormField
        control={form.control}
        name={`grants.${index}.type`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              Type of grant <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token-house-mission">
                    Token House Mission
                  </SelectItem>
                  <SelectItem value="foundation-mission">
                    Foundation Mission
                  </SelectItem>
                  <SelectItem value="foundation-grant">
                    Foundation Grant (Partner fund & other)
                  </SelectItem>
                  <SelectItem value="other-grant">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {!isOptimism && !isOther && (
        <FormItem className="flex flex-col gap-1.5">
          <FormLabel className="text-[#85868C]">Additional details</FormLabel>
          <Input disabled placeholder="Add details" />
        </FormItem>
      )}

      {isOptimism && <OptimismFundingForm form={form} index={index} />}
      {isOther && <OtherFundingForm form={form} index={index} />}
    </div>
  )
}
export const OptimismFundingForm = ({
  form,
  index,
}: {
  form: UseFormReturn<z.infer<typeof FundingFormSchema>>
  index: number
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name={`grants.${index}.link`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              Grant specifics <span className="text-destructive">*</span>
            </FormLabel>
            <FormDescription className="!mt-0">
              Add a link to the grant website or github issue.
            </FormDescription>
            <FormControl>
              <Input {...field} placeholder="Add a link" className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.amount`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              How much OP did you receive?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter a number"
                  className="pl-11"
                />
                <Image
                  priority
                  alt="optimism logo"
                  src="/assets/images/optimism-small.png"
                  height={24}
                  width={24}
                  className="absolute left-2.5 top-2"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.date`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              When did you sign your grant agreement?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormDescription className="!mt-0">
              Please use the format YYYY-MM-DD
            </FormDescription>
            <FormControl>
              <Input {...field} placeholder="YYYY-MM-DD" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.details`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel>Details</FormLabel>
            <FormDescription className="!mt-0">
              Include any details you&apos;d like to about this funding.
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add a description"
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export const OtherFundingForm = ({
  form,
  index,
}: {
  form: UseFormReturn<z.infer<typeof FundingFormSchema>>
  index: number
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name={`grants.${index}.name`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              Name <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Title of grant" className="" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.amount`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              How much funding did you receive?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_AMOUNTS.map((amount) => (
                    <SelectItem key={amount.value} value={amount.value}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.year`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1.5">
            <FormLabel className="text-foreground">
              When did you receive this funding?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`grants.${index}.details`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Details</FormLabel>
            <FormDescription className="!mt-0">
              Include any details you&apos;d like to about this funding.
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add a description"
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
