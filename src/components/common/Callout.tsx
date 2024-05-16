import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"

export const Callout = memo(function Callout({
  className,
  type,
  text,
  linkText,
  linkHref,
}: {
  className?: string
  type: "info" | "error"
  text: string
  linkText?: string
  linkHref?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl p-4 w-full",
        type === "error"
          ? "bg-red-200 text-destructive-foreground"
          : "bg-accent text-accent-foreground",
        className,
      )}
    >
      <Image
        alt="Info"
        src={
          type === "error"
            ? "/assets/icons/info-red.svg"
            : "/assets/icons/info-blue.svg"
        }
        width={16.5}
        height={16.5}
      />
      <p className="ml-2 mr-5 text-sm font-medium">{text}</p>
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
