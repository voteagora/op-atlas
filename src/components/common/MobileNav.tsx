import { MoveUpRight } from "lucide-react"
import Link from "next/link"

import ExternalLink from "../ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { menuList } from "./Navbar"

export function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute z-50 bg-white top-18 w-full h-[calc(100vh-72px)] py-6 px-8 flex flex-col gap-6">
      <Link className="text-2xl font-semibold" href="/rounds" onClick={onClose}>
        Rounds
      </Link>
      <Link
        className="text-2xl font-semibold"
        href="/round/results"
        onClick={onClose}
      >
        Projects
      </Link>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-semibold hover:no-underline">
            More
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 py-6">
            {menuList.map((item, index) => (
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
