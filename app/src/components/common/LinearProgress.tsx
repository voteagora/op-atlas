"use client"

import { useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type LinearProgressProps = {
  current: number
  total?: number | null
  label?: string
  helperText?: string
  className?: string
  id?: string
}

export function LinearProgress({
  current,
  total,
  label,
  helperText,
  className,
  id,
}: LinearProgressProps) {
  const { percentage, formattedFraction } = useMemo(() => {
    const safeTotal =
      typeof total === "number" && total > 0 ? Math.max(total, 1) : null
    const clampedCurrent = safeTotal
      ? Math.max(0, Math.min(current, safeTotal))
      : Math.max(0, current)

    const pct =
      safeTotal !== null && safeTotal > 0
        ? Math.min(100, (clampedCurrent / safeTotal) * 100)
        : clampedCurrent > 0
          ? 100
          : 0

    const fraction =
      safeTotal !== null
        ? `${clampedCurrent} / ${safeTotal}`
        : `${clampedCurrent}`

    return {
      percentage: pct,
      formattedFraction: fraction,
    }
  }, [current, total])

  const labelText = label ?? "Progress"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between text-xs text-foreground">
        <span>{labelText}</span>
        <span>{formattedFraction}</span>
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Progress
                id={id}
                value={percentage}
                className="h-2.5 bg-destructive/10"
                indicatorClassName="bg-destructive transition-[transform] duration-500 ease-out shadow-[0_0_12px_rgba(220,38,38,0.35)]"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percentage)}
                aria-label={labelText}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="border-border bg-popover px-2 py-1 text-sm text-popover-foreground"
          >
            {Math.round(percentage)}%
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {helperText ? (
        <p className="text-xs text-muted-foreground transition-colors">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
