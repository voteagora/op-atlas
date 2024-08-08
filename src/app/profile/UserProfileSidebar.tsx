"use client"

import { Organization } from "@prisma/client"
import { Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function UserProfileSidebar({
  organizations,
}: {
  organizations?: Organization[]
}) {
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
              "text-lg pb-0.5 w-4",
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
              "text-lg pb-0.5 w-4",
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
              "text-lg pb-0.5 w-4",
            )}
          >
            •
          </div>
          Verified addresses
        </Link>
      </div>
      <div className="py-2.5 px-3 border-b border-border text-sm font-semibold">
        Your organizations
      </div>
      <div className="flex flex-col gap-0.5 text-secondary-foreground text-sm py-2.5">
        {organizations?.map((organization, index) => (
          <Link
            key={index}
            href={`/profile/organizations//${organization.id}`}
            className={cn(
              currentPage === organization.id && "text-foreground",
              "flex gap-2 items-center",
            )}
          >
            <div
              className={cn(
                currentPage !== organization.id && "invisible",
                "text-lg pb-0.5 w-4",
              )}
            >
              •
            </div>
            {organization.name}
          </Link>
        ))}

        {currentPage === "new" && (
          <Link
            href="/profile/organizations/new"
            className={cn(
              currentPage === "new" && "text-foreground",
              "flex gap-2 items-center",
            )}
          >
            <div className="text-lg pb-0.5 w-4">•</div>
            New organization
          </Link>
        )}

        <Link
          href="/profile/organizations/new"
          className="flex gap-2 items-center py-1"
        >
          <Plus size={16} />
          Make an organization
        </Link>
      </div>
    </div>
  )
}
