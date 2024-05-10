"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { cn } from "@/lib/utils"

import { Account } from "./Account"

const activeClass = "border-b-4 border-[#0F111A] text-text-default"

const Navbar = () => {
  const pathname = usePathname()
  const isRounds = pathname === "/" || pathname === "/rounds"
  return (
    <nav className="sticky inset-x-0 top-0 h-18 bg-white flex justify-between px-6 shadow-sm z-20">
      <div className="flex gap-12 items-center">
        <Link href="/">
          <Image
            src="/assets/images/logo.svg"
            height={24}
            width={167}
            priority
            alt=""
          />
        </Link>
        <div
          className={cn(
            "group flex gap-10 font-semibold text-text-muted h-full self-stretch hover:border-b-4 hover:border-[#0F111A] hover:text-text-default",
            isRounds ? "border-b-4 border-[#0F111A] text-text-default" : "",
          )}
        >
          <div className="flex items-center">
            <Link
              className={isRounds ? "mt-1" : "group-hover:mt-1"}
              href="/rounds"
            >
              Rounds
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center">
        <Account />
      </div>
    </nav>
  )
}

export default Navbar
