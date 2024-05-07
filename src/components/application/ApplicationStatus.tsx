import { Application } from "@prisma/client"
import { format } from "date-fns"

import { cn } from "@/lib/utils"

import { CheckIconFilled } from "../icons/checkIconFilled"

export const ApplicationStatus = ({
  className,
  application,
}: {
  className?: string
  application: Application
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-4 p-6 border rounded-2xl",
        className,
      )}
    >
      <CheckIconFilled />
      <div className="flex flex-col">
        <p className="font-medium">Retro Funding Round 4: Onchain Builders</p>
        <p className="text-secondary-foreground">
          Applied, {format(application.createdAt, "MMM d, h:mm a")}
        </p>
      </div>
    </div>
  )
}
