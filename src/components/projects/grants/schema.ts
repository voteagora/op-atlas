import { z } from "zod"

export type FundingType = "venture" | "revenue" | "grants" | "none"

export const FUNDING_TYPES = [
  {
    type: "grants",
    label: "Grants",
    description:
      "This project has received grants from Optimism or another entity. Examples: Token House Missions, Foundation Missions, Foundation Grants.",
  },
  {
    type: "venture",
    label: "Venture Funding",
    description:
      "This project has received funding provided by individuals or investment firms in exchange for equity ownership.",
  },
  {
    type: "revenue",
    label: "Revenue",
    description: "This project has earned revenue.",
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
  type: z
    .literal("token-house-mission")
    .or(z.literal("foundation-mission"))
    .or(z.literal("foundation-grant"))
    .optional(),
  link: z.string().url("Please enter a valid URL"),
  amount: z.string().min(1, "Please enter a valid amount"),
  // TODO: Swap with z.string().date() once released: https://github.com/colinhacks/zod/issues/3387
  date: z.string().refine((str: string) => {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(str) &&
      new Date(str).toISOString().startsWith(str)
    )
  }, "Please use the format YYYY-MM-DD"),
  details: z.string().max(280).optional(),
})

export const RevenueSchema = z.object({
  amount: z.string().min(1, "Please include revenue"),
  details: z.string().optional(),
})

export const OtherGrantSchema = z.object({
  type: z.literal("other-grant"),
  name: z.string().min(1, "Please enter a grant name"),
  amount: z.string().min(1, "Please select an amount"),
  year: z.string().min(1, "Please select a year"),
  details: z.string().max(280).optional(),
})

export const GrantsSchema = z.array(OptimismGrantSchema.or(OtherGrantSchema))

export const FundingFormSchema = z.object({
  venture: z.array(VentureSchema),
  grants: GrantsSchema,
  revenue: z.array(RevenueSchema),
})
