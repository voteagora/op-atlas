import { MoveUpRight } from "lucide-react"
import Link from "next/link"

import ExternalLink from "../ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

export function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute bg-white top-18 w-full h-[calc(100vh-72px)] py-6 px-8 flex flex-col gap-6">
      <Link className="text-2xl font-semibold" href="/rounds" onClick={onClose}>
        Rounds
      </Link>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-semibold hover:no-underline">
            More
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 py-6">
            <ExternalLink
              className="flex items-center text-sm font-medium gap-1"
              href="https://app.optimism.io/retropgf"
            >
              <div>About Retro Funding</div>
              <MoveUpRight size={12} />
            </ExternalLink>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
