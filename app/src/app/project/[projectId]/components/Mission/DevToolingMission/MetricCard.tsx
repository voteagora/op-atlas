"use client"
import React from "react"

export default function MetricCard({
  value,
  title,
  index,
  sign = { value: "", position: "right" },
}: {
  value: string | number
  title: string
  index: number
  sign?: {
    value: string
    position: "left" | "right"
  }
}) {
  const formattedValue = value
    ? `${sign.position === "left" ? sign.value : ""}${value}${
        sign.position === "right" ? sign.value : ""
      }`
    : "- -"

  return (
    <div
      key={index}
      className="flex flex-col justify-between p-6 bg-background rounded-xl border"
    >
      <div className="w-full flex items-center justify-between space-x-1">
        <p className="font-normal text-base">{formattedValue}</p>
      </div>
      <p className="text-base leading-6 text-secondary-foreground flex items-start space-x-2">
        <span>{title}</span>
      </p>
    </div>
  )
}
