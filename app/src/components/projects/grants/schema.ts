import { z } from "zod"

export type FundingType =
  | "venture"
  | "revenue"
  | "grants"
  | "retroFunding"
  | "none"
export type PRICINGMODELTYPES = "free" | "freemium" | "pay_to_use"

export const PRICING_MODEL_TYPES = [
  {
    type: "free",
    label: "Free",
    description:
      "The product or service is completely free to use without any charges",
  },
  {
    type: "freemium",
    label: "Freemium",
    description:
      "Part of the product or service is free to use while some features or services require payment",
  },
  {
    type: "pay_to_use",
    label: "Pay to use",
    description: "Users have to pay to access the product or service",
  },
] as const

export const FUNDING_TYPES = [
  {
    type: "grants",
    label: "Optimism Grants (since Jan 2023)",
    description:
      "This project has received grants from Optimism. Examples: Token House Missions, Foundation Missions, Foundation Grants.",
  },
  {
    type: "retroFunding",
    label: "Optimism Retro Funding (excluding round 1)",
    description: "",
  },
  {
    type: "venture",
    label: "Investment (since Jan 2020)",
    description:
      "This project has received funding provided by individuals or investment firms in exchange for equity ownership.",
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

export const RetroFundingSchema = z.object({
  amount: z.string().min(1, "Please include revenue"),
  fundingRound: z.string().min(1, "Please select a funding round"),
})

export const InvestmentSchema = z.object({
  amount: z.string().min(1, "Please include revenue"),
  year: z.string().min(1, "Please select a year"),
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

export const FundingFormSchema = z
  .object({
    retroFunding: z.array(RetroFundingSchema),
    grants: GrantsSchema,
    investment: z.array(InvestmentSchema),
    pricingModel: z.string(),
    pricingModelDetail: z.string().optional(),
  })
  .refine(
    (data) => {
      return ["freemium", "paytouse"].includes(data.pricingModel)
        ? !!data.pricingModelDetail
        : true
    },
    {
      message: "Pricing detail is required",
      path: ["pricingModelDetail"],
    },
  )
