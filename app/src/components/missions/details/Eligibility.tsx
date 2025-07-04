"use client"

import { useMemo, useState } from "react"

import { Callout } from "@/components/common/Callout"
import { Checkbox } from "@/components/ui/checkbox"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"

export const Eligibility = () => {
  const mission = useMissionFromPath()
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const eligibilityItems = useMemo(
    () => mission?.missionPageEligibility || [],
    [mission?.missionPageEligibility],
  )

  // Calculate progress for different item types
  const { requiredItems, extraRewardItems, optionalItems } = useMemo(() => {
    const required: number[] = []
    const extraRewards: number[] = []
    const optional: number[] = []

    eligibilityItems.forEach((item, index) => {
      if (item.type === "required") required.push(index)
      else if (item.type === "extraRewards") extraRewards.push(index)
      else optional.push(index)
    })

    return {
      requiredItems: required,
      extraRewardItems: extraRewards,
      optionalItems: optional,
    }
  }, [eligibilityItems])

  const checkedRequiredCount = requiredItems.filter(
    (index) => checkedItems[index],
  ).length
  const checkedExtraRewardsCount = extraRewardItems.filter(
    (index) => checkedItems[index],
  ).length
  const allRequiredChecked =
    requiredItems.length > 0 && checkedRequiredCount === requiredItems.length
  const hasCheckedExtraRewards = checkedExtraRewardsCount > 0

  // Calculate percentage based on required items only
  const percentage =
    requiredItems.length > 0
      ? Math.round((checkedRequiredCount / requiredItems.length) * 100)
      : 0

  // Determine callout type and message
  const getCalloutConfig = () => {
    if (allRequiredChecked && hasCheckedExtraRewards) {
      return {
        type: "success" as const,
        message: "You should be eligible for additional rewards!",
        barColor: "bg-success-foreground",
      }
    }
    if (allRequiredChecked) {
      return {
        type: "success" as const,
        message: "You should be eligible!",
        barColor: "bg-success-foreground",
      }
    }
    if (checkedRequiredCount > 0) {
      return {
        type: "optimismBright" as const,
        message: `${percentage}%`,
        barColor: "bg-destructive",
      }
    }
    return {
      type: "gray" as const,
      message: "0%",
      barColor: "bg-gray",
    }
  }

  const { type: calloutType, message, barColor } = getCalloutConfig()

  const handleCheckChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: checked,
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold">Check your eligibility</p>
      <Callout
        type={calloutType}
        showIcon={false}
        className="p-6 w-full"
        rightAlignedContent={
          <div className="flex-col items-center w-full text-center">
            <div className="w-full h-3 bg-neutral-200 rounded-sm relative overflow-hidden">
              <div
                className={cn(
                  "h-full bg-primary rounded-sm transition-all duration-300",
                  barColor,
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-base font-semibold mt-4">{message}</p>
          </div>
        }
      />
      <div className="flex flex-col gap-4 pt-2">
        {eligibilityItems.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <Checkbox
              checked={checkedItems[index] || false}
              onCheckedChange={(checked) =>
                handleCheckChange(index, checked as boolean)
              }
              className="mt-1"
            />
            <div
              className="flex-1 cursor-pointer select-none"
              onClick={() => handleCheckChange(index, !checkedItems[index])}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleCheckChange(index, !checkedItems[index])
                }
              }}
              role="button"
              tabIndex={0}
            >
              {item.reactNode}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
