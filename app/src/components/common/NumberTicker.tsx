"use client"

import { useInView, useMotionValue, useSpring } from "motion/react"
import { ComponentPropsWithoutRef, useEffect, useRef } from "react"

import { cn } from "@/lib/utils/index"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number | string
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

// Helper function to parse value with suffix
function parseValueWithSuffix(value: string | number): {
  number: number
  suffix: string
} {
  if (typeof value === "number") {
    return { number: value, suffix: "" }
  }

  const match = value.toString().match(/^([0-9.]+)([A-Za-z]*)$/)
  if (match) {
    return {
      number: parseFloat(match[1]),
      suffix: match[2],
    }
  }

  return { number: 0, suffix: "" }
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const { number: targetNumber, suffix } = parseValueWithSuffix(value)
  const motionValue = useMotionValue(
    direction === "down" ? targetNumber : startValue,
  )
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : targetNumber)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [motionValue, isInView, delay, targetNumber, direction, startValue])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          const formattedNumber = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
          ref.current.textContent = `${formattedNumber}${suffix}`
        }
      }),
    [springValue, decimalPlaces, suffix],
  )

  return (
    <span
      ref={ref}
      className={cn("inline-block text-black dark:text-white", className)}
      {...props}
    >
      {startValue}
      {suffix}
    </span>
  )
}
