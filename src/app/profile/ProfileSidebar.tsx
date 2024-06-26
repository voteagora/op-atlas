"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function ProfileSidebar() {
  const pathname = usePathname()

  const currentPage = pathname.split("/").slice(-1)[0]

  return (
    <div className="flex flex-col">
      <div className="py-2.5 px-3 border-b border-border text-sm font-semibold">
        Profile settings
      </div>
      <div className="flex flex-col gap-0.5 text-secondary-foreground text-sm py-2.5">
        <Link
          href="/profile/details"
          className={cn(
            currentPage === "details" && "text-foreground",
            "flex gap-2 items-center",
          )}
        >
          <div
            className={cn(
              currentPage !== "details" && "invisible",
              "text-lg pb-0.5",
            )}
          >
            •
          </div>
          Details
        </Link>
        <Link
          href="/profile/connected-apps"
          className={cn(
            currentPage === "connected-apps" && "text-foreground",
            "flex gap-2 items-center",
          )}
        >
          <div
            className={cn(
              currentPage !== "connected-apps" && "invisible",
              "text-lg pb-0.5",
            )}
          >
            •
          </div>
          Connected apps
        </Link>
        <Link
          href="/profile/verified-addresses"
          className={cn(
            currentPage === "verified-addresses" && "text-foreground",
            "flex gap-2 items-center",
          )}
        >
          <div
            className={cn(
              currentPage !== "verified-addresses" && "invisible",
              "text-lg pb-0.5",
            )}
          >
            •
          </div>
          Verified addresses
        </Link>
      </div>
    </div>
  )
}
