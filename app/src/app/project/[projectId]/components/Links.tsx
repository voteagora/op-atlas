"use client"
import { ChevronDown, Link2 as LinkIcon } from "lucide-react"
import Link from "next/link"
import React from "react"

export default function Links() {
  const [loadedLinks, setLoadedLinks] = React.useState(LINKS.slice(0, 5))
  const loadMoreCount =
    LINKS.length - loadedLinks.length >= 5
      ? 5
      : LINKS.length - loadedLinks.length
  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Links</h4>
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
      {loadedLinks.length >= LINKS.length ? null : (
        <button
          className="flex items-center space-x-2 text-secondary-foreground font-medium text-sm"
          onClick={() => {
            setLoadedLinks(LINKS.slice(0, loadedLinks.length + loadMoreCount))
          }}
        >
          <span>Load {loadMoreCount} more</span>
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  )
}

// TODO: Replace this with actual data
const LINKS = [
  {
    url: "link_placeholder.com/1",
  },
  {
    url: "link_placeholder.com/2",
  },
  {
    url: "link_placeholder.com/3",
  },
  {
    url: "link_placeholder.com/4",
  },
  {
    url: "link_placeholder.com/5",
  },
  {
    url: "link_placeholder.com/6",
  },
  {
    url: "link_placeholder.com/7",
  },
  {
    url: "link_placeholder.com/8",
  },
  {
    url: "link_placeholder.com/9",
  },
  {
    url: "link_placeholder.com/10",
  },
  {
    url: "link_placeholder.com/11",
  },
]
//
