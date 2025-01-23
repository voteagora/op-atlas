import Image from "next/image"
import React, { memo, ReactNode } from "react"

type CalloutProperties = {
  backgroundColor: string
  textColor: string
  icon: string
}

const types = {
  info: {
    backgroundColor: "bg-accent",
    textColor: "text-accent-foreground",
    icon: "/assets/icons/info-blue.svg",
  } as CalloutProperties,
  error: {
    backgroundColor: "bg-red-200",
    textColor: "text-destructive-foreground",
    icon: "/assets/icons/info-red.svg",
  } as CalloutProperties,
  success: {
    backgroundColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "/assets/icons/info-green.svg",
  } as CalloutProperties,

  optimism: {
    backgroundColor: "bg-optimismRed",
    textColor: "text-white",
  } as CalloutProperties,

  optimismBright: {
    backgroundColor: "bg-red-100",
    textColor: "text-red-600",
  } as CalloutProperties,
}

const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "",
  lg: "text-lg",
  xl: "text-xl",
  xxl: "text-2xl",
}

const iconSizes = {
  xs: 8,
  sm: 12,
  base: 16.5,
  lg: 20,
  xl: 24,
  xxl: 28,
}

export const Callout = memo(function Callout({
  type,
  showIcon = true,
  leftAlignedContent,
  rightAlignedContent,
  leftHandSize = "base",
  rightHandSize = "base",
  iconSize = "base",
}: {
  type?: keyof typeof types
  showIcon?: boolean
  leftAlignedContent?: ReactNode
  rightAlignedContent?: ReactNode
  leftHandSize?: keyof typeof textSizes
  rightHandSize?: keyof typeof textSizes
  iconSize?: keyof typeof iconSizes
}) {
  return (
    <div
      className={`flex items-center rounded-md py-2.5 px-3 w-full ${
        type && types[type].backgroundColor
      } ${type && types[type].textColor}`}
    >
      {showIcon && type && types[type].icon && (
        <Image
          alt="Info"
          src={types[type].icon}
          width={iconSizes[iconSize]}
          height={iconSizes[iconSize]}
        />
      )}

      <div
        className={`mr-5 font-medium ${textSizes[leftHandSize]} ${
          showIcon && "ml-2"
        }`}
      >
        {leftAlignedContent}
      </div>
      <div
        className={`ml-auto shrink-0 font-medium ${textSizes[rightHandSize]}`}
      >
        {rightAlignedContent}
      </div>
    </div>
  )
})
