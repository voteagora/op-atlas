"use client"

import { Organization } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function UserProfileSidebar({
  organizations,
}: {
  organizations?: Organization[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const currentPage = pathname.split("/").slice(-1)[0]

  const [dashboardLoading, setDashboardLoading] = useState(false)

  const handleGoBack = () => {
    setDashboardLoading(true)
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col gap-y-6">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-medium text-secondary-foreground !p-0 justify-start"
      >
        Your profile
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
        <div className="flex flex-col gap-0.5 text-secondary-foreground text-sm">
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
                  "text-lg text-muted-foreground pb-0.5 w-4",
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
    </div>
  )
}
