import Image from "next/image"

import { cn } from "@/lib/utils"

function OutboundArrowLink({
  text,
  target,
  subtext,
  icon,
  className,
}: {
  text: string
  target: string
  subtext?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group flex items-center gap-x-3", className)}
    >
      {icon}
      <span className="group-hover:underline inline-flex items-center">
        {text}
        <Image
          src="/assets/icons/arrow-up-right.svg"
          width={10}
          height={10}
          alt="External link"
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
        />
      </span>
      {subtext && <span className="text-md text-gray-500">{subtext}</span>}
    </a>
  )
}

export default OutboundArrowLink
