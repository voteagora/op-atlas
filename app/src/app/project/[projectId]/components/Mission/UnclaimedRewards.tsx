import { EyeOff } from "lucide-react"
import { Info } from "lucide-react"
import Link from "next/link"

import ExtendedLink from "@/components/common/ExtendedLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function UnclaimedRewards() {
  return (
    <div className="space-y-6">
      <div className="text-semibold flex items-center space-x-2">
        <span>Unclaimed rewards</span>
        <EyeOff size={16} />
      </div>
      <Accordion
        type="single"
        collapsible
        className="rounded-lg border bg-background p-6"
      >
        <AccordionItem value="unclaimed-rewards">
          <AccordionContent>
            <div className="flex items-center w-full justify-between">
              <div className="flex flex-col justify-between">
                <span className="font-semibold text-foreground">1,580 OP</span>
                <span className="text-secondary-foreground">Available</span>
              </div>
              <ExtendedLink
                as="button"
                variant="primary"
                // TODO: Replace this with actual link
                href={"#"}
                text="Add your grant delivery address"
              />
            </div>
          </AccordionContent>
          <AccordionTrigger>
            <span className="text-secondary-foreground text-sm font-medium">
              How to claim your rewards
            </span>
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
      <div className="space-x-2 flex items-center">
        <Info size={16} className="text-white" fill="#B80018" />
        <span className="text-red-500">
          You can’t claim your tokens until you’ve completed KYC for your grant
          {/* TODO: Replace Link href with actual address */}
          delivery address. You can do this in your{" "}
          <Link href={"#"} className="underline">
            project settings
          </Link>
          .
        </span>
      </div>
    </div>
  )
}
