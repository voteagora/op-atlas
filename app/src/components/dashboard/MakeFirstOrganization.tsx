import Image from "next/image"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

const MakeFirstOrganization = ({
  className,
  onClick,
}: {
  className?: string
  onClick: () => void
}) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "flex gap-x-6 border rounded-xl p-8 items-center justify-start h-fit hover:shadow-sm hover:opacity-100 hover:text-primary",
        className,
      )}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-x-4">
          <div className="flex items-center justify-center border border-dashed border-[#BCBFCD] overflow-hidden rounded-full h-12 w-12 shrink-0">
            <Image
              src="/assets/icons/user-icon.svg"
              width={13}
              height={17}
              alt="Plus"
            />
          </div>
          <div className=" flex flex-col justify-start text-start">
            <h3 className="text-base font-semibold">Make an organization</h3>
            <p className="text-base font-normal text-secondary-foreground">
              Group your team&apos;s projects in one place.
            </p>
          </div>
        </div>
        <Badge className="flex justify-center items-center w-10 h-4 p-2 bg-callout-foreground">
          New
        </Badge>
      </div>
    </Button>
  )
}

export default MakeFirstOrganization
