import Image from "next/image"

interface PricingAndInvestmentProps {
  pricingModel?: string | null | "free" | "freemium"
}

export default function PricingAndInvestment({
  pricingModel,
}: PricingAndInvestmentProps) {
  if (!pricingModel?.length) return null

  return (
    <div className="space-y-6 w-full">
      <h4 className="text-xl font-semibold">Pricing and investment</h4>
      <div className="pl-6">
        {pricingModel === "free" && (
          <div className="flex items-start space-x-2">
            <Image
              src="/assets/icons/price-tag.svg"
              width={24}
              height={24}
              alt="Free"
            />
            <p className="text-secondary-foreground">
              <span className="text-foreground font-medium">Free</span> · The
              product or service is completely free to use without any charges
            </p>
          </div>
        )}
        {!Boolean(pricingModel) && (
          <div className="flex items-start space-x-2">
            <Image
              src="/assets/icons/hand-coin.svg"
              width={24}
              height={24}
              alt="Free"
            />
            <p className="text-secondary-foreground">
              <span className="text-foreground font-medium">No investment</span>{" "}
              · This project has not received funding provided by individuals or
              investment firms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
