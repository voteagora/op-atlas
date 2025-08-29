"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  // 1-based index of current step
  currentStep: number
  // 1-based index of max reachable step (from DB)
  maxReachableStep?: number
  onStepClick?: (step: number) => void
}

export default function StepIndicator({
  steps,
  currentStep,
  maxReachableStep,
  onStepClick,
}: StepIndicatorProps) {
  const stepsCount = steps.length
  // Use n equal middle segments with half-length at both ends.
  // Circle k (1..n) sits at ((k - 0.5)/n) of the width.
  // Red progress goes to ((currentStep - 0.5)/n).
  const progressPct = Math.min(
    100,
    Math.max(0, ((currentStep - 0.5) / Math.max(stepsCount, 1)) * 100)
  )

  return (
    <div className="relative h-16 select-none">
      {/* Base line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border" />

      {/* Progress line */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-optimismRed"
        style={{ width: `${progressPct}%` }}
      />

      {/* Steps (labels + circles) */}
      <div className="relative h-full">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const leftPct = (((index + 1) - 0.5) / Math.max(stepsCount, 1)) * 100
          const isCurrent = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          const maxStep = maxReachableStep || currentStep
          const isReachable = stepNumber <= maxStep
          const clickable = Boolean(onStepClick && isReachable)

          return (
            <div
              key={stepNumber}
              className="absolute inset-y-0 -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
            >
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => clickable && onStepClick?.(stepNumber)}
                className={cn(
                  "relative h-full flex items-start justify-center outline-none",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                {/* Label */}
                <span
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-0 text-sm transition-colors text-secondary-foreground",
                  )}
                >
                  {label}
                </span>

                {/* Circle aligned to the line */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block h-3 w-3 rounded-full border",
                    isCompleted
                      ? "bg-optimismRed border-optimismRed"
                      : "bg-muted border-border",
                  )}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
