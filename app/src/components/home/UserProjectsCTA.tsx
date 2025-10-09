"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { AddFill } from "@/components/icons/remix"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export const UserProjectsCTA = () => {
  const { track } = useAnalytics()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === "authenticated"
  const router = useRouter()
  const { login } = usePrivy()
  const [isLoggingInWithClick, setIsLoggingInWithClick] = useState(false)

  let content = (
    <div className="justify-center text-[#0f111a] text-base font-normal leading-normal group-hover:underline">
      Add your first project
    </div>
  )
  if (isAuthenticated) {
    content = (
      <div className="justify-center text-[#0f111a] text-base font-normal leading-normal group-hover:underline">
        View your dashboard
      </div>
    )
  }

  const handleLogin = () => {
    setIsLoggingInWithClick(true)
    login()
  }

  useEffect(() => {
    if (isLoggingInWithClick && isAuthenticated) {
      setIsLoggingInWithClick(false)
      router.push("/dashboard")
    }
  }, [isLoggingInWithClick, isAuthenticated, router])

  const handleClick = () => {
    track("Link Click", {
      source: "home_page",
      linkName: isAuthenticated
        ? "View your dashboard"
        : "Add your first project",
      linkUrl: isAuthenticated ? "/dashboard" : "/dashboard",
      category: "User Projects CTA",
      elementType: "Div: Role=Button",
      elementName: content.toString() || "Add your first project",
    })
    if (!isAuthenticated) {
      handleLogin()
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div
      className="px-10 py-12 bg- rounded-xl inline-flex justify-center items-center gap-3 overflow-hidden bg-secondary group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick()
        }
      }}
    >
      {!isAuthenticated && <AddFill />}
      {content}
    </div>
  )
}
