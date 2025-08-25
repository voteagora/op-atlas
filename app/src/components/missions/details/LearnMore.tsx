import Image from "next/image"
import React from "react"

import ExternalLink from "@/components/ExternalLink"

export interface LearnMoreLink {
  title: string
  href: string
}

interface LearnMoreProps {
  links: LearnMoreLink[]
}

export function LearnMore({ links }: LearnMoreProps) {
  if (!links || links.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Learn more</h2>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <div key={index} className="w-full flex flex-col gap-1.5">
            <ExternalLink
              href={link.href}
              className="pl-3 pr-14 py-2.5 bg-background rounded-md border border-border inline-flex items-center gap-2 text-sm text-secondary-foreground hover:bg-secondary hover:underline transition-colors"
            >
              <Image
                src="/assets/icons/link-icon.svg"
                alt="link"
                width={20}
                height={20}
              />
              <span className="text-base text-secondary-foreground">
                {link.title}
              </span>
            </ExternalLink>
          </div>
        ))}
      </div>
    </div>
  )
}
