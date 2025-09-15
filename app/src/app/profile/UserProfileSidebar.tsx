"use client"

import { Organization } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IncompleteCard } from "@/components/projects/ProjectStatusSidebar"
import { useOrganizationSidebarData } from "@/hooks/db/useOrganizationSidebarData"

export function UserProfileSidebar({
  organizations,
}: {
  organizations?: Organization[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const currentPage = pathname.split("/").slice(-1)[0]

  const [dashboardLoading, setDashboardLoading] = useState(false)
  
  const { data: organizationsData, isLoading: organizationsLoading } = useOrganizationSidebarData({
    organizations,
    pathname,
  })

  const handleGoBack = () => {
    setDashboardLoading(true)
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col gap-y-6 w-full max-w-[228px]">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-medium text-secondary-foreground !p-0 justify-start"
      >
        Dashboard
        <Image
          src="/assets/icons/arrow-left.svg"
          height={8}
          width={6}
          alt="arrow"
          className="ml-2"
        />
      </Button>
      <div>
        <div className="py-1.5 border-b border-border text-sm font-semibold text-foreground">
          Settings
        </div>
        <div className="flex flex-col gap-0.5 text-secondary-foreground text-sm">
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
                "text-lg pb-0.5 w-4 text-muted-foreground",
              )}
            >
              •
            </div>
            Profile details
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
                "text-lg pb-0.5 w-4 text-muted-foreground",
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
                "text-lg pb-0.5 w-4 text-muted-foreground",
              )}
            >
              •
            </div>
            Verified addresses
          </Link>
        </div>
      </div>
      <div>
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Organizations
        </div>
        <ul className="text-sm space-y-1.5 py-3.5">
          {organizationsData.map((orgData, index) => {
            const {
              organization,
              incompleteProject,
              isLinkActive,
              isGrantAddressActive,
            } = orgData

            return (
              <li key={index} className={"flex flex-col"}>
                <Link
                  href={`/profile/organizations/${organization.id}`}
                  className={cn([
                    "text-secondary-foreground font-normal space-x-2",
                    { "text-foreground font-medium": isLinkActive },
                  ])}
                >
                  <span
                    className={cn([
                      "opacity-0 text-lg",
                      { "opacity-100": isLinkActive && !isGrantAddressActive },
                    ])}
                  >
                    •
                  </span>
                  <span>{organization.name}</span>
                </Link>
                <Link
                  href={`/profile/organizations/${organization.id}/grant-address`}
                  className={cn([
                    "text-secondary-foreground space-x-2 pl-4 flex flex-row ",
                    {
                      "text-foreground font-medium": isGrantAddressActive,
                    },
                  ])}
                >
                  <span
                    className={cn([
                      "font-medium text-foreground",
                      { "opacity-100": isGrantAddressActive },
                    ])}
                  >
                    •
                  </span>
                  <div className="flex flex-row gap-2">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-foreground text-[14px]">
                      Grant Addresses
                    </span>
                    {/* Only shows if Project status resolves to 'PENDING' */}
                    <IncompleteCard project={incompleteProject} />
                  </div>
                </Link>
              </li>
            )
          })}

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
        </ul>
      </div>
    </div>
  )
}
