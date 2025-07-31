"use client"

import { useEffect, useMemo, useState } from "react"

import { Callout } from "@/components/common/Callout"
import { Checkbox } from "@/components/ui/checkbox"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export const Eligibility = () => {
  const mission = useMissionFromPath()
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const eligibilityItems = useMemo(
    () => mission?.missionPageEligibility || [],
    [mission?.missionPageEligibility],
  )
  const { track } = useAnalytics()

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
        message: "You should be eligible for additional rewards!",
        barWidth: `${percentage}%`,
        barGradient: "bg-gradient-to-r from-[#39D551] to-[#0DA529]",
        backgroundColor: "bg-[#D6FFDA]",
        barBgColor: "bg-[#D6FFDA]",
        textColor: "text-[#006117]",
      }
    }
    if (allRequiredChecked) {
      return {
        message: "You should be eligible!",
        barWidth: `${percentage}%`,
        barGradient: "bg-gradient-to-r from-[#39D551] to-[#0DA529]",
        backgroundColor: "bg-[#D6FFDA]",
        barBgColor: "bg-[#D6FFDA]",
        textColor: "text-[#006117]",
      }
    }
    if (checkedRequiredCount > 0) {
      return {
        message: `${percentage}%`,
        barWidth: `${percentage}%`,
        barGradient: "bg-gradient-to-r from-brand-primary to-brand-primary",
        backgroundColor: "bg-[#FFD1D5]",
        barBgColor: "bg-[#FF99A1]",
        textColor: "text-[#B80018]",
      }
    }
    return {
      message: "0%",
      backgroundColor: "bg-[#F2F3F8]",
      barBgColor: "bg-tertiary",
      barWidth: "0%",
      barGradient: "bg-gradient-to-r from-tertiary to-tertiary",
      textColor: "text-secondary-foreground",
    }
  }

  const {
    message,
    barWidth,
    barGradient,
    backgroundColor,
    barBgColor,
    textColor,
  } = getCalloutConfig()

  const handleCheckChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: checked,
    }))
    if (checked) {
      track("Eligibility Check", {
        missionName: mission?.name,
        index: index,
        parameter: eligibilityItems[index].type,
        text: eligibilityItems[index],
      })
    }
  }

  useEffect(() => {
    if (percentage === 100) {
      track("Eligibility Check Fulfilled", {
        missionName: mission?.name,
      })
    }
  }, [percentage, mission?.name, track])

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold">Check your eligibility</p>
      <Callout
        type="info"
        showIcon={false}
        className={cn(
          "p-6 w-full rounded-xl transition-all duration-100",
          backgroundColor,
        )}
        rightAlignedContent={
          <div className="flex-col items-center w-full text-center">
            <div
              className={cn(
                "w-full h-3 rounded-[2px] relative overflow-hidden",
                barBgColor,
              )}
            >
              <div
                className={cn(
                  "h-full rounded-[2px] transition-all duration-300",
                  barGradient
                )}
                style={{ width: barWidth }}
              />
            </div>
            <p className={cn("text-base font-semibold mt-4", textColor)}>
              {message}
            </p>
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
              className="mt-1 h-6 w-6"
            />
            <div
              className="flex-1 cursor-pointer select-none self-end"
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
