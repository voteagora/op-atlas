"use client"

import {
  AlignJustify,
  ArrowUpRight,
  ChevronUp,
  MoveUpRight,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState } from "react"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { Account } from "./Account"
import { MobileNav } from "./MobileNav"

export const menuList = [
  {
    title: "Voting App",
    href: "https://round5.optimism.io/",
  },
  {
    title: "About Retro Funding",
    href: "https://app.optimism.io/retropgf",
  },
]

const dropdownList = [
  {
    title: "Optimism",
    href: "https://optimism.io/",
  },
  {
    title: "Retro Funding",
    href: "https://atlas.optimism.io/",
  },
  {
    title: "Forum",
    href: "https://gov.optimism.io/",
  },
  {
    title: "Delegates",
    href: "https://vote.optimism.io/",
  },
]

const Navbar = () => {
  const pathname = usePathname()
  const isRounds = pathname === "/" || pathname === "/rounds"
  const isProjects = pathname.includes("/round/")

  const [showMobileNav, setShowMobileNav] = useState(false)

  return (
    <>
      <nav className="sticky inset-x-0 top-0 h-18 bg-white flex px-6 shadow-sm z-20">
        <div className="flex items-center justify-between h-full w-full max-w-7xl mx-auto">
          <div className="flex gap-12 items-center h-full">
            <button
              className={showMobileNav ? "block" : "sm:hidden"}
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              {showMobileNav ? (
                <X />
              ) : (
                <AlignJustify className="block sm:hidden" />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-full focus:outline-none focus:opacity-80">
                <Image
                  src="/assets/images/logo.svg"
                  height={24}
                  width={167}
                  priority
                  alt=""
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 flex flex-col gap-1"
                sideOffset={0}
                side="bottom"
                align="start"
              >
                {dropdownList.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <ExternalLink href={item.href}>
                      <div>{item.title}</div>
                      <ArrowUpRight size={14} />
                    </ExternalLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div
              className={cn(
                "hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-[#0F111A] hover:text-text-default",
                isRounds ? "border-b-4 border-[#0F111A] text-text-default" : "",
              )}
            >
              <div className="flex items-center">
                <Link
                  className={`${
                    isRounds ? "mt-1" : "group-hover:mt-1"
                  } focus:outline-none focus:opacity-80`}
                  href="/rounds"
                >
                  Retro Rounds
                </Link>
              </div>
            </div>
            <div
              className={cn(
                "hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-[#0F111A] hover:text-text-default",
                isProjects
                  ? "border-b-4 border-[#0F111A] text-text-default"
                  : "",
              )}
            >
              <div className="flex items-center">
                <Link
                  className={`${
                    isProjects ? "mt-1" : "group-hover:mt-1"
                  } focus:outline-none focus:opacity-80`}
                  href="/round/results/5"
                >
                  Recipients
                </Link>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-full focus:outline-none focus:opacity-80">
                <div className="hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-bg-tertiary hover:text-text-default">
                  <div className="flex items-center gap-1 group-hover:mt-1 cursor-pointer">
                    <div>More</div>
                    <ChevronUp size={12} />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 flex flex-col gap-1"
                sideOffset={0}
                side="bottom"
                align="start"
              >
                {menuList.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="focus:bg-none! focus:opacity-80"
                  >
                    <ExternalLink
                      className="flex items-center gap-1"
                      href={item.href}
                    >
                      <div>{item.title}</div>
                      <ArrowUpRight size={14} />
                    </ExternalLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden sm:flex items-center">
            <Account />
          </div>
        </div>
      </nav>
      {showMobileNav && <MobileNav onClose={() => setShowMobileNav(false)} />}
    </>
  )
}

export default Navbar
