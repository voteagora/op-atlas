import { MoveUpRight } from "lucide-react"
import Link from "next/link"

import ExternalLink from "../ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { dropdownList, grantLinks } from "./Navbar"

export function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute z-50 bg-white top-24 w-full h-[calc(100vh-72px)] py-6 px-8 flex flex-col gap-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-semibold hover:no-underline">
            Grants
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 py-6">
            {grantLinks.map((item, index) => (
              <Link
                key={index}
                className="flex items-center text-sm font-medium gap-1"
                href={item.href}
                onClick={onClose}
              >
                <div>{item.title}</div>
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Link
        className="text-2xl font-semibold"
        href="/round/results"
        onClick={onClose}
      >
        Projects
      </Link>
      <Link
        className="text-2xl font-semibold"
        href="/governance"
        onClick={onClose}
      >
        Governance
      </Link>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-semibold hover:no-underline">
            More
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 py-6">
            {dropdownList.map((item, index) => (
              <ExternalLink
                key={index}
                className="flex items-center text-sm font-medium gap-1"
                href={item.href}
              >
                <div>{item.title}</div>
                <MoveUpRight size={12} />
              </ExternalLink>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
