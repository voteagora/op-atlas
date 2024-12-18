import Image from "next/image"
import { ReactNode } from "react"

interface BubbleLinkProps {
  href: string
  icon: string
  text: ReactNode
  tooltipText: string
}

function BubbleLink({ href, icon, text, tooltipText }: BubbleLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-x-2 rounded-full bg-gray-100 px-3 py-1 hover:bg-gray-200 transition-colors"
    >
      <Image src={icon} width={14} height={13} alt={tooltipText} />
      <span className="text-sm text-secondary-foreground">{text}</span>
      <span className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-sm shadow-md opacity-0 transition-opacity group-hover:opacity-100">
        {tooltipText}
      </span>
    </a>
  )
}

export default BubbleLink
