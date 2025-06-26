import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronRight } from "lucide-react"
import React from "react"

interface BreadcrumbsProps {
  values: {
    label: string
    href: string
  }[]
  className?: string
}

const Breadcrumbs = ({ values, className = "" }: BreadcrumbsProps) => (
  <Breadcrumb>
    <BreadcrumbList>
      {values.map((value, index) => (
        <>
          <BreadcrumbItem key={index}>
            <BreadcrumbLink href={value.href}>{value.label}</BreadcrumbLink>
          </BreadcrumbItem>
          {index < values.length - 1 && (
            <BreadcrumbSeparator>
              <ChevronRight />
            </BreadcrumbSeparator>
          )}
        </>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
)

export default Breadcrumbs
