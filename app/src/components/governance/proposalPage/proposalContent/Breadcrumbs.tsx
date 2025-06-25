import { ChevronRight } from "lucide-react"
import React from "react"

interface BreadcrumbsProps {
  values: string[]
  className?: string
}

const Breadcrumbs = ({ values, className = "" }: BreadcrumbsProps) => (
  <div className={`flex items-center ${className}`}>
    {values.map((value, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={16} width={16} height={16} />}
        <Breadcrumb value={value} index={index} />
      </React.Fragment>
    ))}
  </div>
)

const Breadcrumb = ({ value, index }: { value: string; index: number }) => (
  <p
    className={`font-normal text-[14px] leading-[20px] tracking-[0%] ${
      index === 0 ? "muted-foreground" : "foreground"
    }`}
  >
    {value}
  </p>
)

export default Breadcrumbs
