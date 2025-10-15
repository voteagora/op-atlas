import { Triangle } from "lucide-react"

import { cn } from "@/lib/utils"

export default function MetricCard({
  value,
  title,
  trend,
  index,
  sign = { value: "", position: "right" },
}: {
  value: string | number
  title: string
  trend?: { value: string; type: "increase" | "decrease" }
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
        {/* TODO: Add trend back in later */}
        {/* {value && trend?.value !== "0" ? (
          <div
            className={cn([
              "px-2.5 py-1 rounded-full text-xs font-normal flex space-x-1 items-center",
              {
                "bg-green-100 text-green-foreground":
                  trend?.type === "increase",
                "bg-red-100 text-red-foreground": trend?.type === "decrease",
              },
            ])}
          >
            <span>{trend?.value}%</span>
            {trend?.type === "increase" ? (
              <Triangle
                size={12}
                className="text-success-foreground"
                fill="#006117"
              />
            ) : (
              <Triangle
                size={12}
                className="rotate-180 text-red-600"
                fill="#B80018"
              />
            )}
          </div>
        ) : null} */}
      </div>
      <p className="text-base leading-6 text-secondary-foreground flex items-center space-x-2">
        <span>{title}</span>
      </p>
    </div>
  )
}
