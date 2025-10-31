"use client"

import { ReactNode } from "react"

import Image from "next/image"
import { AlertCircle, Check, CheckCircle2, Info, Loader2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  const Icon = icon
    ? icon === "loading"
      ? Loader2
      : icon === "check"
      ? Check
      : icon === "success"
      ? CheckCircle2
      : icon === "info"
      ? Info
      : icon === "warning"
      ? AlertCircle
      : XCircle
    : null

  const iconClasses = icon
    ? icon === "loading"
      ? "text-primary animate-spin"
      : icon === "check"
      ? "text-foreground"
      : icon === "success"
      ? "text-success-strong"
      : icon === "info"
      ? "text-primary"
      : icon === "warning"
      ? "text-amber-500"
      : "text-destructive"
    : ""

  return (
    <div className="flex flex-col items-center gap-4">
      {customImage ? (
        <Image src={customImage} alt={title} width={64} height={64} className="h-16 w-16" />
      ) : Icon ? (
        <Icon className={cn("h-16 w-16", iconClasses)} />
      ) : null}

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
