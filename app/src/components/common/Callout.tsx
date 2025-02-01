import Image from "next/image"
import Link from "next/link"
import React, { memo } from "react"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"

export const Callout = memo(function Callout({
  className,
  type,
  text,
  linkText,
  linkHref,
  showIcon = true,
  leftAlignedContent,
  rightAlignedContent,
}: {
  className?: string
  type:
    | "info"
    | "error"
    | "success"
    | "optimismBright"
    | "optimism"
    | "plain"
    | "gray"
  text?: string
  linkText?: string
  linkHref?: string
  showIcon?: boolean
  leftAlignedContent?: React.ReactNode
  rightAlignedContent?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md py-2.5 px-3 w-full",
        type === "error"
          ? "bg-red-200 text-destructive-foreground"
          : type === "info"
          ? "bg-accent text-info"
          : type === "success"
          ? "bg-green-100 text-green-800"
          : type === "optimismBright"
          ? "text-red-600 bg-red-100"
          : type === "optimism"
          ? "text-white bg-optimismRed"
          : type === "gray"
          ? "text-secondary-foreground bg-secondary"
          : "",
        className,
      )}
    >
      {showIcon && (
        <Image
          alt="Info"
          src={
            type === "error"
              ? "/assets/icons/info-red.svg"
              : type === "info"
              ? "/assets/icons/info-blue.svg"
              : "/assets/icons/info-green.svg"
          }
          width={16.5}
          height={16.5}
        />
      )}
      {text && (
        <p className={cn("mr-5 text-sm font-medium", showIcon && "ml-2")}>
          {text}
        </p>
      )}

      {leftAlignedContent}
      {rightAlignedContent}
      {linkText && (
        <ExternalLink
          href={linkHref ?? "#"}
          className="ml-auto text-sm font-medium shrink-0"
        >
          {linkText}
        </ExternalLink>
      )}
    </div>
  )
})
