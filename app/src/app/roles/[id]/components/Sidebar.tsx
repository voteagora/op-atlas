"use client"

import { Role } from "@prisma/client"
import { usePrivy } from "@privy-io/react-auth"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { useHasApplied } from "@/hooks/role/useHasApplied"
import { LOCAL_STORAGE_LOGIN_REDIRECT } from "@/lib/constants"

export const Sidebar = ({ role }: { role: Role }) => {
  const { status: authStatus, data: session } = useSession()
  const isAuthenticated = authStatus === "authenticated"

  const { login } = usePrivy()
  const pathname = usePathname()
  const router = useRouter()
  const isLoggingIn = useRef(false)

  const { hasApplied, isLoading: isLoadingHasApplied } = useHasApplied({
    userId: session?.user?.id || "",
    roleId: role.id,
    enabled: isAuthenticated,
  })

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

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      isLoggingIn.current = true
      localStorage.setItem(LOCAL_STORAGE_LOGIN_REDIRECT, pathname)
      login()
    } else if (isApplicationWindow) {
      router.push(`/roles/${role.id}/apply`)
    }
  }

  const renderButton = () => {
    if (hasApplied) {
      return null
    }

    const buttonText = !isAuthenticated
      ? "Sign in"
      : isApplicationWindow
      ? "Apply Now"
      : "Coming Soon"

    return (
      <Button
        className="w-full button-primary"
        disabled={
          (isAuthenticated && !isApplicationWindow) || isLoggingIn.current
        }
        onClick={handleButtonClick}
      >
        {isLoggingIn.current ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>
    )
  }

  if (isLoadingHasApplied || !authStatus) {
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

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-secondary-foreground">
          {hasApplied ? "You're a candidate!" : "Self-nominate"}
        </div>
        {hasApplied ? (
          <div className="text-sm text-secondary-foreground">
            You submitted a self-nomination application.
          </div>
        ) : (
          <div className="text-sm text-secondary-foreground">
            Submit your application between
            <br />
            {role.startAt && role.endAt && (
              <>
                {format(new Date(role.startAt), "MMM d")} -{" "}
                {format(new Date(role.endAt), "MMM d")}
              </>
            )}
          </div>
        )}
      </div>
      {renderButton()}
    </div>
  )
}
