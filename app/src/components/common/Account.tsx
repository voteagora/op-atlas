"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserById } from "@/db/users"
import { AUTH_STATUS } from "@/lib/constants"
import { useIsBadgeholder, usePrevious } from "@/lib/hooks"
import {
  hasShownWelcomeBadgeholderDialog,
  isFirstTimeUser,
  saveHasShownWelcomeBadgeholderDialog,
  saveLogInDate,
} from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { useAppDialogs } from "@/providers/DialogProvider"

export const Account = () => {
  const {
    login: privyLogin,
    logout: privyLogout,
    user: privyUser,
    authenticated: privyAuthenticated,
    getAccessToken,
  } = usePrivy()

  const isPrivyAuthInProgress = useRef(false)

  const { data: session, status } = useSession()
  const { isBadgeholder } = useIsBadgeholder()
  const previousAuthStatus = usePrevious(status)
  const router = useRouter()
  const { setOpenDialog } = useAppDialogs()
  const { track } = useAnalytics()

  const pathName = usePathname()
  const isMissionsPath = pathName.includes("/missions")

  const logOut = useCallback(() => {
    Promise.all([privyLogout(), signOut({ redirect: false })]).catch((err) => {
      toast.error(`Error logging out. ${err}`)
    })
  }, [privyLogout])

  async function checkBadgeholderStatus(id: string) {
    const user = await getUserById(id)
    if (!user || !isBadgeholder) return

    if (!hasShownWelcomeBadgeholderDialog()) {
      setOpenDialog("welcome_badgeholder")
      saveHasShownWelcomeBadgeholderDialog()
    }
  }

  // Handle log ou
  useEffect(() => {
    if (
      !privyAuthenticated &&
      status === AUTH_STATUS.UNAUTHENTICATED &&
      isPrivyAuthInProgress.current
    ) {
      console.log("*****************************************")
      console.log("LOGOUT AND DONE")
      console.log("*****************************************")

      isPrivyAuthInProgress.current = false
      router.push("/")
    }
  }, [status, router, privyAuthenticated])

  // Handle Privy login
  useEffect(() => {
    if (
      privyUser &&
      !isPrivyAuthInProgress.current &&
      status === AUTH_STATUS.UNAUTHENTICATED
    ) {
      console.log("*****************************************")
      console.log("CREATING NEXT AUTH SESSION")
      console.log("*****************************************")

      isPrivyAuthInProgress.current = true

      getAccessToken()
        .then((token) => {
          signIn("credentials", {
            wallet: privyUser?.wallet?.address,
            email: privyUser?.email?.address,
            farcaster: privyUser?.farcaster
              ? JSON.stringify(privyUser.farcaster)
              : undefined,
            token: token,
            redirect: false,
          })
            .then((res) => {
              if (res?.url) {
                router.push(res.url)
              }
            })
            .catch(() => {
              privyLogout().then(() => {
                toast.error("Unable to login at this time. Try again later.")
              })
            })
        })
        .catch(() => {
          toast.error("Unable to create Privy session. Try again later.")
        })
    }
  }, [privyUser, getAccessToken, privyLogout, router, status])

  // Handle Login logic
  useEffect(() => {
    if (
      status === AUTH_STATUS.AUTHENTICATED &&
      previousAuthStatus === AUTH_STATUS.UNAUTHENTICATED &&
      isPrivyAuthInProgress.current
    ) {
      console.log("*****************************************")
      console.log("SUCCESSFUL SIGN IN")
      console.log("*****************************************")

      track("Successful Sign In", { userId: session?.user?.id })
      saveLogInDate()

      if (!isMissionsPath) {
        router.push("/dashboard")
      }

      if (!isFirstTimeUser()) {
        if (!session.user.email) {
          setOpenDialog("email")
        } else {
          checkBadgeholderStatus(session?.user?.id)
        }
      }
    }
  }, [
    status,
    previousAuthStatus,
    session,
    track,
    isMissionsPath,
    router,
    setOpenDialog,
    checkBadgeholderStatus,
  ])

  {
    /* 
        The Farcaster AuthKitContext does not persist state across page reloads, so we must store and read 
        auth data from our own next-auth context.
    */
  }

  if (status === AUTH_STATUS.LOADING) {
    return null
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none focus:opacity-80">
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-secondary h-10 px-4 py-2 gap-x-2.5 text-sm font-medium">
            <Avatar className="!w-6 !h-6">
              <AvatarImage src={session.user?.image || ""} alt="avatar" />
              <AvatarFallback>{session.user?.name}</AvatarFallback>
            </Avatar>{" "}
            {session.user?.name}
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              width={10}
              height={6}
              alt=""
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 flex flex-col gap-1 z-[9999]"
        >
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              Dashboard
            </DropdownMenuItem>
          </Link>
          <hr className="w-full border-[0.5px] border-border" />
          <Link href="/profile/details">
            <DropdownMenuItem className="cursor-pointer">
              Profile details
            </DropdownMenuItem>
          </Link>
          <Link href="/profile/connected-apps">
            <DropdownMenuItem className="cursor-pointer">
              Connected apps
            </DropdownMenuItem>
          </Link>
          <Link href="/profile/verified-addresses">
            <DropdownMenuItem className="cursor-pointer">
              Verified addresses
            </DropdownMenuItem>
          </Link>
          <Link href="/profile/organizations/new">
            <DropdownMenuItem className="cursor-pointer">
              Organizations
            </DropdownMenuItem>
          </Link>
          <hr className="w-full border-[0.5px] border-border" />
          <DropdownMenuItem className="cursor-pointer" onClick={logOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return (
      <button
        type="button"
        className="cursor-pointer text-white bg-brand-primary rounded-md px-4 py-2"
        onClick={privyLogin}
      >
        Sign in
      </button>
    )
  }
}
