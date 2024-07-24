import Image from "next/image"
import React from "react"

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
        "flex gap-x-6 border rounded-2xl p-8 items-center justify-start h-fit",
        className,
      )}
    >
      <div className="flex items-center justify-center border border-dashed border-[#BCBFCD] overflow-hidden rounded-full h-12 w-12 shrink-0">
        <Image
          src="/assets/icons/user-icon.svg"
          width={13}
          height={17}
          alt="Plus"
        />
      </div>
      <h3>Make an organization</h3>
    </Button>
  )
}

export default MakeFirstOrganization
