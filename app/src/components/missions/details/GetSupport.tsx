import React from "react"

import { Button } from "@/components/ui/button"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export interface SupportOption {
  type: "telegram" | "office-hours" | "form" | "custom"
  title: string
  description: string
  buttonText: string
  buttonLink?: string
  icon?: React.ReactNode
  externalLink?: boolean
}

export function GetSupport() {
  const mission = useMissionFromPath()
  const supportOptions = mission?.supportOptions || []
  const { track } = useAnalytics()

  if (supportOptions.length === 0) return null

  const getIcon = (option: SupportOption) => {
    if (option.icon) return option.icon
    switch (option.type) {
      case "telegram":
        return (
          <Image
            src="/assets/icons/telegram.svg"
            alt={option.title}
            width={24}
            height={24}
          />
        )
      case "office-hours":
        return (
          <Image
            src="/assets/icons/video.svg"
            alt={option.title}
            width={24}
            height={24}
          />
        )
      default:
        return null
    }
  }

  const buttonClickHandler = (option: SupportOption) => {
    if (option.buttonLink) {
      window.open(option.buttonLink, "_blank")
    }
    track("Link Click", {
      href: option.buttonLink,
      text: option.buttonText,
      type: option.type,
      elementType: "Button",
      elementName: option.type,
    })
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Get support</h2>
      <div
        className={`grid grid-cols-1 ${
          supportOptions.length > 1 ? "md:grid-cols-2" : ""
        } gap-3`}
      >
        {supportOptions.map((option, index) => (
          <div
            key={index}
            className="p-6 bg-background border border-border rounded-xl flex flex-col gap-6 justify-between"
          >
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1 flex flex-col">
                <h3 className="text-base font-semibold">{option.title}</h3>
                <p className="text-secondary-foreground text-base">
                  {option.description}
                </p>
              </div>
              {getIcon(option)}
            </div>
            <Button
              variant="secondary"
              size="default"
              className="w-fit"
              onClick={() => buttonClickHandler(option)}
            >
              {option.buttonText}
              {option.externalLink && <ArrowUpRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
