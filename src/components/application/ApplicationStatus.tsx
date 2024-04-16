import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CheckIconFilled } from "../icons/checkIconFilled"
import { Button } from "../ui/button"

export const ApplicationStatus = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-4 p-5 border rounded-2xl bg-background",
        className,
      )}
    >
      <CheckIconFilled />
      <div className="flex flex-col">
        <p>Retro Funding Round 4: Onchain Builders</p>
        <p className="text-muted-foreground">Applied, March 31, 4:12 PM</p>
      </div>

      <Link href="#" className="ml-auto">
        <Button variant="secondary" className="ml-auto">
          View attestation
          <ArrowUpRight size={16} className="ml-2.5" />
        </Button>
      </Link>
    </div>
  )
}
