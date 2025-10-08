"use client"

import { ProjectLinks } from "@prisma/client"
import { ChevronDown, Link2 as LinkIcon } from "lucide-react"
import Link from "next/link"
import React from "react"

interface LinksProps {
  links?: ProjectLinks[]
}

export default function Links({ links }: LinksProps) {
  const [loadedLinks, setLoadedLinks] = React.useState(links?.slice(0, 5) ?? [])
  if (!links?.length) {
    return null
  }

  const loadMoreCount =
    links.length - loadedLinks.length >= 5
      ? 5
      : links.length - loadedLinks.length

  return (
    <div className="w-full space-y-6">
      <h4 className="font-normal text-xl">Links</h4>
      <ul className="space-y-2 pl-6">
        {loadedLinks.map((link, index) => (
          <li key={index} className="flex space-x-2 items-center">
            <LinkIcon size={24} className="-rotate-45" />
            <Link href={link.url} className="text-foreground">
              {link.url}
            </Link>
          </li>
        ))}
      </ul>
      <button
        className="flex items-center space-x-2 text-secondary-foreground font-normal text-sm"
        onClick={() => {
          setLoadedLinks(links.slice(0, loadedLinks.length + loadMoreCount))
        }}
      >
        <span>Load {loadMoreCount} more</span>
        <ChevronDown size={24} />
      </button>
    </div>
  )
}
