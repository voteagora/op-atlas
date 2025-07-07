"use client"

import {
  useLinkAccount,
  useLogin,
  useLogout,
  usePrivy,
  User as PrivyUser,
} from "@privy-io/react-auth"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { AUTH_STATUS, LOCAL_STORAGE_LOGIN_REDIRECT } from "@/lib/constants"
import { useIsBadgeholder, usePrevious } from "@/lib/hooks"
import {
  hasShownWelcomeBadgeholderDialog,
  isFirstTimeUser,
  saveHasShownWelcomeBadgeholderDialog,
  saveLogInDate,
} from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { useAppDialogs } from "@/providers/DialogProvider"

import { UserAvatar } from "@/components/common/UserAvatar"

export const Account = () => {
  const { user: privyUser, getAccessToken } = usePrivy()

  const isLinking = useRef(false)
  const isLoggingIn = useRef(false)

  const { data: session, status: authStatus } = useSession()
  const { user, invalidate: invalidateUser } = useUser({
    id: session?.user?.id || "",
    enabled: !!session?.user,
  })

  const username = useUsername(user)

  const { login: privyLogin } = useLogin({
    onComplete: (params) => {
      onPrivyLogin(params.user)
    },
  })

  // Connect email when a new user logs in
  const { linkEmail } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "email" && isLinking.current) {
        toast.promise(
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => (isLinking.current = false)),
          {
            loading: "Adding email...",
            success: "Email added successfully",
            error: "Failed to add email",
          },
        )
      }
    },
  })

  const { logout: privyLogout } = useLogout({
    onSuccess: () => {
      isLoggingIn.current = false
      signOut()
    },
  })

  const prevAuthStatus = usePrevious(authStatus)

  const { isBadgeholder } = useIsBadgeholder()
  const router = useRouter()

  const { setOpenDialog } = useAppDialogs()
  const { track } = useAnalytics()

  const pathName = usePathname()
  const isMissionsPath = pathName.includes("/missions")
  const isRolePath = pathName.includes("/role")

  const didLogIn =
    prevAuthStatus === AUTH_STATUS.UNAUTHENTICATED &&
    authStatus === AUTH_STATUS.AUTHENTICATED

  async function checkBadgeholderStatus() {
    if (!user || !isBadgeholder) return

    if (!hasShownWelcomeBadgeholderDialog()) {
      setOpenDialog("welcome_badgeholder")
      saveHasShownWelcomeBadgeholderDialog()
    }
  }

  const onPrivyLogin = (user: PrivyUser) => {
    isLoggingIn.current = true
    getAccessToken()
      .then((token) => {
        signIn("credentials", {
          privy: JSON.stringify(user),
          privyAccessToken: token,
          redirect: false,
        }).catch(() => {
          toast.error("Unable to login at this time. Try again later.")
        })
      })
      .catch(() => {
        toast.error("Unable to create Privy session. Try again later.")
      })
  }

  useEffect(() => {
    if (didLogIn) {
      isLoggingIn.current = false
      saveLogInDate()
      track("Successful Sign In", { userId: session.user.id })

      const loginRedirect = localStorage.getItem(LOCAL_STORAGE_LOGIN_REDIRECT)
      if (loginRedirect) {
        localStorage.removeItem(LOCAL_STORAGE_LOGIN_REDIRECT)
        router.push(loginRedirect)
      } else if (!isMissionsPath) {
        router.refresh()
      }

      if (!isFirstTimeUser()) {
        if (!privyUser?.email?.address) {
          linkEmail()
          isLinking.current = true
        } else {
          checkBadgeholderStatus()
        }
      } else {
        track("Profile created", { userId: session.user.id })
      }
    }
  }, [
    authStatus,
    prevAuthStatus,
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

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none focus:opacity-80">
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-secondary h-10 px-4 py-2 gap-x-2.5 text-sm font-medium">
            <UserAvatar imageUrl={user?.imageUrl} size={"sm"} />

            {username}
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
          <Link href="/citizenship">
            <DropdownMenuItem className="cursor-pointer">
              Citizen Registration
            </DropdownMenuItem>
          </Link>
          <hr className="w-full border-[0.5px] border-border" />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              privyLogout()
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return (
      <button
        type="button"
        className={`cursor-pointer text-sm text-primary-foreground leading-5 rounded-md px-4 py-2.5 flex items-center justify-center h-10 ${
          isLoggingIn.current ? "bg-gray-300" : "bg-brand-primary"
        }`}
        onClick={privyLogin}
      >
        {isLoggingIn.current ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Sign in"
        )}
      </button>
    )
  }
}
