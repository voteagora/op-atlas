"use client"

import { Role } from "@prisma/client"
import { usePrivy } from "@privy-io/react-auth"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useActiveUserApplications } from "@/hooks/role/useActiveUserApplications"
import { LOCAL_STORAGE_LOGIN_REDIRECT } from "@/lib/constants"
import { formatMMMd } from "@/lib/utils/date"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export const Sidebar = ({ role }: { role: Role }) => {
  const { track } = useAnalytics()
  const { status: authStatus, data: session } = useSession()
  const isAuthenticated = authStatus === "authenticated"

  const { login } = usePrivy()
  const pathname = usePathname()
  const router = useRouter()
  const isLoggingIn = useRef(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const { data: activeApplications, isLoading: isLoadingActiveApplications } =
    useActiveUserApplications({
      userId: session?.user?.id || "",
      enabled: isAuthenticated,
    })

  const hasAppliedForThisRole =
    activeApplications?.some((app) => app.roleId === role.id) || false
  const hasAppliedThisSeason =
    (activeApplications && activeApplications.length > 0) || false

  const isApplicationWindow =
    role.startAt &&
    role.endAt &&
    new Date() >= new Date(role.startAt) &&
    new Date() <= new Date(role.endAt)

  useEffect(() => {
    if (isAuthenticated && isLoggingIn.current) {
      isLoggingIn.current = false
    }
  }, [isAuthenticated])

  // Reset navigation state when pathname changes (navigation completed)
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      isLoggingIn.current = true
      localStorage.setItem(LOCAL_STORAGE_LOGIN_REDIRECT, pathname)
      login()
    } else if (isApplicationWindow) {
      let btext
      if (role.startAt && new Date() < new Date(role.startAt)) {
        btext = "Coming Soon"
      } else if (role.endAt && new Date() > new Date(role.endAt)) {
        btext = "Application closed"
      } else {
        btext = "Apply Now"
      }
      track("Button Click", {
        button_type: "Nominate Yourself",
        role_name: role.title,
        role_id: role.id,
        candidate_user_id: session?.user?.id || null,
        elementType: "Button",
        elementName: btext,
      })

      setIsNavigating(true)
      router.push(`/governance/roles/${role.id}/apply`)
    }
  }

  const renderButton = () => {
    if (hasAppliedThisSeason) {
      return null
    }

    let buttonText = "Apply Now"

    if (role.startAt && new Date() < new Date(role.startAt)) {
      buttonText = "Coming Soon"
    } else if (role.endAt && new Date() > new Date(role.endAt)) {
      buttonText = "Application closed"
    }

    return (
      <Button
        className="w-full button-primary"
        disabled={!isApplicationWindow || isNavigating}
        onClick={handleButtonClick}
        isLoading={isNavigating}
      >
        {buttonText}
      </Button>
    )
  }

  if (isLoadingActiveApplications || !authStatus) {
    return (
      <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-secondary-foreground">
            Loading...
          </div>
          <div className="text-sm text-secondary-foreground">
            Checking application status and eligibility.
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-secondary-foreground">
            Self-nominate
          </div>
          <div className="text-sm text-secondary-foreground">
            Checking application status and eligibility.
          </div>
        </div>
        <Button className="w-full button-primary" onClick={handleButtonClick}>
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-secondary-foreground">
          {hasAppliedThisSeason
            ? hasAppliedForThisRole
              ? "You're a candidate!"
              : "One application per season!"
            : "Self-nominate"}
        </div>
        {hasAppliedThisSeason ? (
          <div className="text-sm text-secondary-foreground">
            {hasAppliedForThisRole
              ? "You submitted a self-nomination application."
              : "You already have an active application for another role."}
          </div>
        ) : (
          <div className="text-sm text-secondary-foreground">
            Submit your application between
            <br />
            {role.startAt && role.endAt && (
              <>
                {formatMMMd(new Date(role.startAt))}
                {" - "}
                {formatMMMd(new Date(role.endAt))}
              </>
            )}
          </div>
        )}
      </div>
      {renderButton()}
    </div>
  )
}
