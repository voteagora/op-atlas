"use client"

import { ReactNode } from "react"

import Image from "next/image"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CheckboxCircleFIll, CloseCircleFill, InformationFill } from "@/components/icons/remix"

type ResultStepProps = {
  title: string
  subtitle: string
  icon?: "success" | "info" | "warning" | "error" | "check" | "loading"
  customImage?: string
  onClose?: () => void
  actions?: ReactNode
}

export function ResultStep({
  title,
  subtitle,
  icon,
  customImage,
  onClose,
  actions,
}: ResultStepProps) {
  const renderIcon = () => {
    if (!icon) return null

    switch (icon) {
      case "loading":
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />
      case "check":
      case "success":
        return <CheckboxCircleFIll className="h-16 w-16" fill="#0DA529" />
      case "info":
        return <InformationFill className="h-16 w-16" fill="hsl(var(--primary))" />
      case "warning":
        return <InformationFill className="h-16 w-16" fill="#f59e0b" />
      case "error":
        return <CloseCircleFill className="h-16 w-16" fill="hsl(var(--destructive))" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {customImage ? (
        <Image src={customImage} alt={title} width={64} height={64} className="h-16 w-16" />
      ) : (
        renderIcon()
      )}

      <div className="flex flex-col gap-2 text-center">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <div className="text-sm text-secondary-foreground">{subtitle}</div>
      </div>

      {actions ? (
        actions
      ) : onClose ? (
        <Button className="button-primary" onClick={() => onClose()}>
          Close
        </Button>
      ) : null}
    </div>
  )
}
