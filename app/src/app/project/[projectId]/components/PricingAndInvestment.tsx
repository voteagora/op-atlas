import Image from "next/image"

export default function PricingAndInvestment() {
  return (
    <div className="space-y-6 w-full">
      <h4 className="text-xl font-semibold">Pricing and investment</h4>
      <ul className="pl-6 space-y-2">
        {ITEMS.map((item, index) => (
          <li key={index}>
            {item.pricing === "free" && (
              <div className="flex items-start space-x-2">
                <Image
                  src="/assets/icons/price-tag.svg"
                  width={24}
                  height={24}
                  alt="Free"
                />
                <p className="text-secondary-foreground">
                  <span className="text-foreground font-medium">Free</span> ·
                  The product or service is completely free to use without any
                  charges
                </p>
              </div>
            )}
            {item.pricing === "no-investment" && (
              <div className="flex items-start space-x-2">
                <Image
                  src="/assets/icons/hand-coin.svg"
                  width={24}
                  height={24}
                  alt="Free"
                />
                <p className="text-secondary-foreground">
                  <span className="text-foreground font-medium">
                    No investment
                  </span>{" "}
                  · This project has not received funding provided by
                  individuals or investment firms.
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// TODO: Replace this with actual data
const ITEMS = [
  {
    pricing: "free",
  },
  {
    pricing: "no-investment",
  },
]
//
