"use client"

import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import { ArrowRight } from "@/components/icons/remix"
import { LOCAL_STORAGE_LOGIN_REDIRECT } from "@/lib/constants"

export const Banner = () => {
  const pathname = usePathname()
  const { status } = useSession()
  const { login } = usePrivy()

  const shouldShowBanner =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/missions" ||
    pathname.includes("/missions/")
  pathname === "/governance" ||
    pathname.startsWith("/round/")

  if (!shouldShowBanner) return null

  if (status === "unauthenticated") {
    return (
      <div className="flex w-full bg-[#3374DB] text-white py-3 items-center justify-center text-[14px] font-normal">
        <button
          onClick={() => {
            localStorage.setItem(LOCAL_STORAGE_LOGIN_REDIRECT, "/citizenship")
            login()
          }}
          className="hover:underline flex flex-row gap-2 items-center"
        >
          <div>Citizen Registration for Season 8 is now open</div>
          <ArrowRight className="w-[18px] h-[18px]" fill="#fff" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full bg-[#3374DB] text-white py-3 items-center justify-center text-[14px] font-normal">
      <Link
        href="/citizenship"
        className="hover:underline flex flex-row gap-2 items-center"
      >
        <div>Citizen Registration for Season 8 is now open</div>
        <ArrowRight className="w-[18px] h-[18px]" fill="#fff" />
      </Link>
    </div>
  )
}
