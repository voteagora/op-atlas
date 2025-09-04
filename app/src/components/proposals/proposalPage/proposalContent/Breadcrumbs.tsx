import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
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
        <React.Fragment key={index}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={value.href}>{value.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {index < values.length - 1 && (
            <BreadcrumbSeparator>
              <ChevronRight />
            </BreadcrumbSeparator>
          )}
        </React.Fragment>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
)

export default Breadcrumbs
