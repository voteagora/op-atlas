"use client"

import { Organization } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useState } from "react"

import { IncompleteCard } from "@/components/projects/ProjectStatusSidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useExpiredKYCCountForOrganization } from "@/hooks/db/useExpiredKYCCount"
import { useOrganizationSidebarData } from "@/hooks/db/useOrganizationSidebarData"
import { cn } from "@/lib/utils"

const OrganizationExpiredBadge = ({
  organizationId,
}: {
  organizationId: string
}) => {
  const { data: expiredCount } = useExpiredKYCCountForOrganization({
    organizationId,
    enabled: !!organizationId,
  })

  if (!expiredCount || expiredCount === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Badge variant="destructive">{expiredCount}</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {expiredCount} expired verification{expiredCount !== 1 ? "s" : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function UserProfileSidebar({
  organizations,
  projects = [],
}: {
  organizations?: Organization[]
  projects?: { id: string; name: string }[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const currentPage = pathname.split("/").slice(-1)[0]

  const [dashboardLoading, setDashboardLoading] = useState(false)

  const { data: organizationsData, isLoading: organizationsLoading } =
    useOrganizationSidebarData({
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
        className="text-sm font-normal text-secondary-foreground !p-0 justify-start"
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
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Your Account
        </div>
        <div className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          <Link
            href="/profile/details"
            className={cn(
              currentPage === "details" && "text-foreground font-medium",
              "flex gap-2 items-center",
            )}
          >
            <div
              className={cn(
                currentPage !== "details" && "invisible",
                "w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground",
              )}
            >
              <span>•</span>
            </div>
            Account Details
          </Link>
          <Link
            href="/profile/connected-apps"
            className={cn(
              currentPage === "connected-apps" && "text-foreground font-medium",
              "flex gap-2 items-center",
            )}
          >
            <div
              className={cn(
                currentPage !== "connected-apps" && "invisible",
                "w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground",
              )}
            >
              <span>•</span>
            </div>
            Connected Apps
          </Link>
          <Link
            href="/profile/verified-addresses"
            className={cn(
              currentPage === "verified-addresses" &&
                "text-foreground font-medium",
              "flex gap-2 items-center",
            )}
          >
            <div
              className={cn(
                currentPage !== "verified-addresses" && "invisible",
                "w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground",
              )}
            >
              <span>•</span>
            </div>
            Linked Wallets
          </Link>
        </div>
      </div>
      <div>
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Your Projects
        </div>
        <ul className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}/details`}
                className="flex gap-2 items-center font-medium text-foreground"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">
                  <span>•</span>
                </div>
                <span className="truncate">{project.name}</span>
              </Link>
              <Link
                href={`/projects/${project.id}/grant-address`}
                className="flex gap-2 items-center ml-6"
              >
                <span className="truncate">Grant Address</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/projects/new"
              className="flex gap-2 items-center"
            >
              <Plus size={16} />
              Create project
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Your Organizations
        </div>
        <ul className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          {organizationsData.map((orgData, index) => {
            const {
              organization,
              incompleteProject,
              isLinkActive,
              isGrantAddressActive,
            } = orgData

            return (
              <li key={index}>
                <Link
                  href={`/profile/organizations/${organization.id}`}
                  className={cn(
                    "flex gap-2 items-center font-medium text-foreground",
                    isLinkActive && !isGrantAddressActive && "text-foreground",
                  )}
                >
                  <div className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">
                    <span>•</span>
                  </div>
                  <span className="truncate">{organization.name}</span>
                </Link>
                <Link
                  href={`/profile/organizations/${organization.id}/grant-address`}
                  className={cn(
                    "flex gap-2 items-center ml-6",
                    isGrantAddressActive && "text-foreground font-medium",
                  )}
                >
                  <span className="truncate">Grant Addresses</span>
                  <IncompleteCard project={incompleteProject} />
                  <OrganizationExpiredBadge organizationId={organization.id} />
                </Link>
              </li>
            )
          })}

          {currentPage === "new" && (
            <li>
              <Link
                href="/profile/organizations/new"
                className="flex gap-2 items-center text-foreground font-medium"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">
                  <span>•</span>
                </div>
                New organization
              </Link>
            </li>
          )}

          <li>
            <Link
              href="/profile/organizations/new"
              className="flex gap-2 items-center"
            >
              <Plus size={16} />
              Create organization
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
