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
import { Banner } from "./Banner"

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

const Navbar = () => {
  const pathname = usePathname()
  const params = useParams()
  const isRounds = pathname === "/missions"
  const isProjects = pathname.includes("/round/")

  const isMissions = pathname.includes("/missions")

  const [showMobileNav, setShowMobileNav] = useState(false)

  return (
    <>
      <nav
        className={`sticky inset-x-0 top-0 h-18 bg-white flex px-6 z-[200] ${params.id || isMissions ? "" : "shadow-sm"
          }`}
      >
        <div
          className={`flex items-center justify-between h-full w-full mx-auto ${params.id || isMissions ? "bg-background" : ""
            }`}
        >
          <div className="flex h-full">
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
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/images/logo.svg"
                height={24}
                width={167}
                priority
                alt=""
              />
            </Link>
            {params.id === undefined || isMissions ? (
              <div className="flex gap-12">
                <div
                  className={cn(
                    "hidden sm:flex group gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-[#0F111A] hover:text-text-default",
                    isRounds
                      ? "border-b-4 border-[#0F111A] text-text-default"
                      : "",
                  )}
                >
                  <div className="flex items-center">
                    <Link
                      className={`${isRounds ? "mt-1" : "group-hover:mt-1"
                        } focus:outline-none focus:opacity-80`}
                      href="/missions"
                    >
                      Retro Missions
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
                      className={`${isProjects ? "mt-1" : "group-hover:mt-1"
                        } focus:outline-none focus:opacity-80`}
                      href="/round/results?rounds=7,8"
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
      <Banner />
    </>
  )
}

export default Navbar
