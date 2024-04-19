import { z } from "zod"

export type FundingType = "venture" | "optimism" | "other" | "none"

export const FUNDING_TYPES = [
  {
    type: "venture",
    label: "Venture Funding",
    description:
      "This project has received funding provided by individuals or investment firms in exchange for equity ownership.",
  },
  {
    type: "optimism",
    label: "Optimism Grants",
    description:
      "This project has received grants from Optimism. Examples: Token House Missions, Foundation Missions, Foundation Grants.",
  },
  {
    type: "other",
    label: "Other Grants",
    description:
      "This project has received grants from entities other than Optimism. Examples: Lorem ipsum, lorem ipsum, lorem ipsum.",
  },
  {
    type: "none",
    label: "None of the Above",
  },
] as const

export const VentureSchema = z.object({
  amount: z.string().min(1, "Please select an amount"),
  year: z.string().min(1, "Please select a year"),
  details: z.string().max(280).optional(),
})

export const OptimismGrantSchema = z.object({
  type: z.string().min(1, "Please select a grant type"),
  link: z.string().url("Please enter a valid URL"),
  amount: z.number({ coerce: true }).min(1, "Please enter a valid amount"),
  // TODO: Swap with z.string().date() once released: https://github.com/colinhacks/zod/issues/3387
  date: z.string().refine((str: string) => {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(str) &&
      new Date(str).toISOString().startsWith(str)
    )
  }, "Please use the format YYYY-MM-DD"),
  details: z.string().max(280).optional(),
})

export const OtherGrantSchema = z.object({
  name: z.string().min(1, "Please enter a grant name"),
  amount: z.string().min(1, "Please select an amount"),
  year: z.string().min(1, "Please select a year"),
  details: z.string().max(280).optional(),
})

export const FundingFormSchema = z.object({
  venture: z.array(VentureSchema),
  optimism: z.array(OptimismGrantSchema),
  other: z.array(OtherGrantSchema),
})
