"use client"

import { AlignJustify, ArrowUpRight, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Account } from "./Account"
import { MobileNav } from "./MobileNav"

export const dropdownList = [
  {
    title: "Optimism",
    href: "https://optimism.io/",
  },
  {
    title: "Forum",
    href: "https://gov.optimism.io/",
  },
  {
    title: "Delegates",
    href: "https://vote.optimism.io/delegates",
  },
]

export const grantLinks = [
  {
    title: "Audit Grants",
    href: "/missions/audit-grants",
  },
  {
    title: "Growth Grants",
    href: "/missions/growth-grants",
  },
  {
    title: "Retro Funding: Dev Tooling",
    href: "/missions/retro-funding-dev-tooling",
  },
  {
    title: "Retro Funding: Onchain Builders",
    href: "/missions/retro-funding-onchain-builders",
  },
  {
    title: "Foundation Missions",
    href: "/missions/foundation-missions",
  },
]

export const Navbar = () => {
  const pathname = usePathname()
  const params = useParams()
  const isProjects = pathname.includes("/round/")
  const isGovernance = pathname === "/governance"

  const isMissions = pathname.includes("/missions")

  const [showMobileNav, setShowMobileNav] = useState(false)

  return (
    <>
      <nav
        className={`sticky inset-x-0 top-0 h-18 bg-white flex px-6 z-[200] ${
          params.id || isMissions ? "" : "shadow-sm"
        }`}
      >
        <div
          className={`flex items-center justify-between h-full w-full mx-auto ${
            params.id || isMissions ? "bg-background" : ""
          }`}
        >
          <div className="flex sm:hidden items-center h-full w-full relative">
            <button
              className="absolute left-0 z-10 flex items-center"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              {showMobileNav ? <X /> : <AlignJustify />}
            </button>
            <div className="absolute inset-x-0 flex items-center justify-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/assets/images/logo.svg"
                  height={24}
                  width={81}
                  priority
                  alt="OP Atlas Logo"
                />
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex h-full">
            <Link href="/" className="flex items-center mr-10">
              <Image
                src="/assets/images/logo.svg"
                height={24}
                width={81}
                priority
                alt="OP Atlas Logo"
              />
            </Link>
            {params.id === undefined || isMissions || isGovernance ? (
              <div className="flex gap-12">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-full focus:outline-none focus:opacity-80">
                    <div className="hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-bg-tertiary hover:text-text-default">
                      <div className="flex items-center gap-1 group-hover:mt-1 cursor-pointer">
                        <div>Grants</div>
                        <ChevronDown size={12} />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="flex flex-col gap-1 w-auto"
                    sideOffset={0}
                    side="bottom"
                    align="start"
                  >
                    {grantLinks.map((item, index) => (
                      <Link
                        key={index}
                        className="cursor-pointer"
                        href={item.href}
                      >
                        <DropdownMenuItem className="flex items-center gap-1 cursor-pointer">
                          <div>{item.title}</div>
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      href="/round/results?rounds=7,8"
                    >
                      Recipients
                    </Link>
                  </div>
                </div>
                <div
                  className={cn(
                    "hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-[#0F111A] hover:text-text-default",
                    isGovernance
                      ? "border-b-4 border-[#0F111A] text-text-default"
                      : "",
                  )}
                >
                  <div className="flex items-center">
                    <Link
                      className={`${
                        isGovernance ? "mt-1" : "group-hover:mt-1"
                      } focus:outline-none focus:opacity-80`}
                      href="/governance"
                    >
                      Governance
                    </Link>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-full focus:outline-none focus:opacity-80">
                    <div className="hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-bg-tertiary hover:text-text-default">
                      <div className="flex items-center gap-1 group-hover:mt-1 cursor-pointer">
                        <div>More</div>
                        <ChevronDown size={12} />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 flex flex-col gap-1"
                    sideOffset={0}
                    side="bottom"
                    align="start"
                  >
                    {dropdownList.map((item, index) => (
                      <ExternalLink
                        className="flex items-center gap-1 cursor-pointer"
                        href={item.href}
                        key={index}
                      >
                        <DropdownMenuItem className="cursor-pointer w-full">
                          <div>{item.title}</div>
                          <ArrowUpRight size={14} />
                        </DropdownMenuItem>
                      </ExternalLink>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <></>
            )}
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
