"use client"

import {
  User as PrivyUser,
  useLinkAccount,
  useLogin,
  useLogout,
  usePrivy,
} from "@privy-io/react-auth"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
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

  const { user: privyUser, getAccessToken } = usePrivy()

  const isLinking = useRef(false);
  const isLoggingIn = useRef(false)

  const { data: session, status: authStatus } = useSession()
  const { user, invalidate: invalidateUser } = useUser({ id: session?.user?.id || "", enabled: !!session?.user })

  const { login: privyLogin } = useLogin({
    onComplete: (params) => {
      onPrivyLogin(params.user)
    },
  })


  // Connect email when a new user logs in
  const { linkEmail } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "email" && isLinking.current) {
        toast.promise(syncPrivyUser(updatedPrivyUser)
          .then(() => invalidateUser())
          .then(() => isLinking.current = false), {
          loading: "Adding email...",
          success: "Email added successfully",
          error: "Failed to add email",
        })
      }
    },
  })

  const { logout: privyLogout } = useLogout({
    onSuccess: () => signOut({ redirect: false }),
  })


  const prevAuthStatus = usePrevious(authStatus)

  const { isBadgeholder } = useIsBadgeholder()
  const router = useRouter()

  const { setOpenDialog } = useAppDialogs()
  const { track } = useAnalytics()

  const pathName = usePathname()
  const isMissionsPath = pathName.includes("/missions")

  const didLogIn =
    prevAuthStatus === AUTH_STATUS.UNAUTHENTICATED &&
    authStatus === AUTH_STATUS.AUTHENTICATED
  const didLogOut =
    prevAuthStatus === AUTH_STATUS.AUTHENTICATED &&
    authStatus === AUTH_STATUS.UNAUTHENTICATED



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

      if (!isMissionsPath) {
        router.push("/dashboard")
      }

      if (!isFirstTimeUser()) {
        if (!privyUser?.email?.address) {
          linkEmail();
          isLinking.current = true;
        } else {
          checkBadgeholderStatus()
        }
      }

    } else if (didLogOut) {
      if (pathName !== "/") {
        router.push("/")
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
            <Avatar className="!w-6 !h-6">
              <AvatarImage src={user?.imageUrl || ""} alt="avatar" />
              <AvatarFallback>{user?.username}</AvatarFallback>
            </Avatar>{" "}
            {user?.username}
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
          <DropdownMenuItem className="cursor-pointer" onClick={privyLogout}>
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
        {isLoggingIn.current ? "Signing in..." : "Sign in"}
      </button>
    )
  }
}
