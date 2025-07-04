import { ArrowUpRight, Calendar, MessageCircle } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

export interface SupportOption {
  type: "telegram" | "office-hours" | "form" | "custom"
  title: string
  description: string
  buttonText: string
  buttonLink?: string
  icon?: React.ReactNode
  buttonIcon?: string
}

export function GetSupport() {
  const mission = useMissionFromPath()
  const supportOptions = mission?.supportOptions || []

  if (supportOptions.length === 0) return null

  const getIcon = (option: SupportOption) => {
    if (option.icon) return option.icon
    switch (option.type) {
      case "telegram":
        return <MessageCircle className="w-6 h-6 text-primary" />
      case "office-hours":
        return <Calendar className="w-6 h-6 text-primary" />
      default:
        return null
    }
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
            className="p-6 bg-background border border-border rounded-xl flex flex-col gap-6"
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
              onClick={() =>
                option.buttonLink && window.open(option.buttonLink, "_blank")
              }
            >
              {option.buttonText}
              {option.type === "form" && (
                <ArrowUpRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
