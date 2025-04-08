import { CheckIcon, XIcon } from "lucide-react"

import { abbreviateNumber } from "@/lib/utils"

export default function NotPassingEligibility({
  month,
  transactionsCount,
  qualifiedAddressesCount,
  distinctDaysCount,
  hasDefillamaAdapter,
}: {
  month: string
  transactionsCount: number
  qualifiedAddressesCount: number
  distinctDaysCount: number
  hasDefillamaAdapter: boolean
}) {
  return (
    <div className="w-full grid lg:grid-cols-2 gap-4 grid-cols-1 data-[state=inactive]:hidden">
      <NotPassingEligibilityContainer
        title="At least 1000 transactions"
        projectValue={transactionsCount}
        passed={transactionsCount >= 1000}
      />
      <NotPassingEligibilityContainer
        title="At least 420 qualified addresses"
        projectValue={qualifiedAddressesCount}
        passed={qualifiedAddressesCount >= 420}
      />
      <NotPassingEligibilityContainer
        title="At least 10 distinct days"
        projectValue={distinctDaysCount}
        passed={distinctDaysCount >= 10}
      />
      <NotPassingEligibilityContainer
        title="Defillama adapter"
        projectValue={hasDefillamaAdapter}
        passed={hasDefillamaAdapter}
      />
    </div>
  )
}

export function NotPassingEligibilityContainer({
  title,
  passed,
  projectValue,
}: {
  title: string
  passed: boolean
  projectValue: number | boolean
}) {
  return (
    <div className="w-full flex items-center space-x-2 p-6 bg-background rounded-xl border">
      {passed ? (
        <CheckIcon size={24} className="text-[#0DA529]" />
      ) : (
        <XIcon size={24} className="text-[#FF0420]" />
      )}
      <div>
        <p className="font-medium text-base text-foreground">{title}</p>
        <p className="text-secondary-foreground text-base">
          This project:{" "}
          {typeof projectValue === "number"
            ? projectValue === 0
              ? 0
              : abbreviateNumber(projectValue)
            : projectValue
            ? "Pass"
            : "Fail"}
        </p>
      </div>
    </div>
  )
}
