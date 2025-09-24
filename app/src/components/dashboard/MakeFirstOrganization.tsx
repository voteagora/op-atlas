import Image from "next/image"

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
        "flex gap-x-6 border rounded-xl p-8 h-fit hover:shadow-sm hover:opacity-100 hover:text-primary",
        className,
      )}
    >
      <div className="flex justify-between w-full">
        <div className="flex gap-4 items-center">
          <div className="flex h-12 w-12 items-center justify-center border border-dashed border-muted overflow-hidden rounded-full shrink-0">
            <Image
              src="/assets/icons/plus.svg"
              width={20}
              height={20}
              alt="Plus"
            />
          </div>
          <div className="flex flex-col text-start">
            <h3 className="text-base font-semibold">Make an organization</h3>
            <p className="text-base font-normal text-secondary-foreground">
              Group your team&apos;s projects in one place.
            </p>
          </div>
        </div>
      </div>
    </Button>
  )
}

export default MakeFirstOrganization
