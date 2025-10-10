"use client"

import {
  useLinkAccount,
  useLogin,
  useLogout,
  usePrivy,
  User as PrivyUser,
} from "@privy-io/react-auth"
import { ethers } from "ethers"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/common/UserAvatar"
import { isTestMode } from "@/lib/auth/testMode"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { useWallet } from "@/hooks/useWallet"
import { AUTH_STATUS, LOCAL_STORAGE_LOGIN_REDIRECT } from "@/lib/constants"
import { useIsBadgeholder, usePrevious } from "@/lib/hooks"
import {
  hasShownWelcomeBadgeholderDialog,
  isFirstTimeUser,
  saveHasShownWelcomeBadgeholderDialog,
  saveLogInDate,
} from "@/lib/utils"
import { truncateAddress } from "@/lib/utils/string"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { useAppDialogs } from "@/providers/DialogProvider"
import { safeService } from "@/services/SafeService"

// EOA Wallet Menu Item Component
type EOAWalletMenuItemProps = {
  currentContext: string
  signerWallet: any
  switchToEOA: () => void
}

// Profile Menu Item Component
type ProfileMenuItemProps = {
  href: string
  label: string
  currentContext: string
}

// Profile Menu Item Component
const ProfileMenuItem = ({
  href,
  label,
  currentContext,
}: ProfileMenuItemProps) => {
  return currentContext === "EOA" ? (
    <Link href={href}>
      <DropdownMenuItem className="cursor-pointer">{label}</DropdownMenuItem>
    </Link>
  ) : (
    <DropdownMenuItem
      className="cursor-pointer text-muted-foreground opacity-50"
      disabled
    >
      {label}
    </DropdownMenuItem>
  )
}

const EOAWalletMenuItem = ({
  currentContext,
  signerWallet,
  switchToEOA,
}: EOAWalletMenuItemProps) => {
  return (
    <DropdownMenuItem
      className={`cursor-pointer flex items-center justify-between px-3 py-2 ${
        currentContext === "EOA" ? "bg-gray-100" : ""
      }`}
      onClick={() => switchToEOA()}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            currentContext === "EOA" ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">EOA Wallet</span>
          <span className="text-xs text-muted-foreground">
            {signerWallet?.address
              ? `${signerWallet.address.slice(
                  0,
                  6,
                )}...${signerWallet.address.slice(-4)}`
              : "Not connected"}
          </span>
        </div>
      </div>
      {currentContext === "EOA" && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
          Active
        </span>
      )}
    </DropdownMenuItem>
  )
}

// Safe Wallets Menu Items Component
type SafeWalletsMenuItemsProps = {
  availableSafeWallets: any[]
  selectedSafeWallet: any
  signerWallet: any
  currentContext: string
  isLoadingSafeWallets: boolean
  switchToSafe: (address: string) => void
}

const SafeWalletsMenuItems = ({
  availableSafeWallets,
  selectedSafeWallet,
  signerWallet,
  currentContext,
  isLoadingSafeWallets,
  switchToSafe,
}: SafeWalletsMenuItemsProps) => {
  const getSafesToRender = () => {
    if (availableSafeWallets.length > 0) return availableSafeWallets
    if (selectedSafeWallet) return [selectedSafeWallet]
    return []
  }

  const safesToRender = getSafesToRender()

  if (safesToRender.length === 0) return null

  return (
    <>
      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
        Safe Wallets {isLoadingSafeWallets && "(Loading...)"}
      </DropdownMenuLabel>
      {safesToRender.map((safeWallet: any) => (
        <DropdownMenuItem
          key={safeWallet.address}
          className={`cursor-pointer flex items-center justify-between px-3 py-2 ${
            currentContext === "SAFE" &&
            selectedSafeWallet?.address === safeWallet.address
              ? "bg-gray-100"
              : ""
          }`}
          onClick={() => switchToSafe(safeWallet.address)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                currentContext === "SAFE" &&
                selectedSafeWallet?.address === safeWallet.address
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Safe Wallet</span>
              <span className="text-xs text-muted-foreground">
                {`${safeWallet.address.slice(
                  0,
                  6,
                )}...${safeWallet.address.slice(-4)}`}
              </span>
            </div>
          </div>
          {currentContext === "SAFE" &&
            (selectedSafeWallet?.address === safeWallet.address ||
              (!selectedSafeWallet &&
                signerWallet?.address === safeWallet.address)) && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Active
              </span>
            )}
        </DropdownMenuItem>
      ))}
    </>
  )
}

// Wrapper component that handles conditional hook usage
const AccountContent = () => {
  // Always call hooks - they will be mocked by the TestModeProvider when in test mode
  const isLinking = useRef(false)
  const isLoggingIn = useRef(false)

  const { data: session, status: authStatus } = useSession()
  const { user, invalidate: invalidateUser } = useUser({
    id: session?.user?.id || "",
    enabled: !!session?.user,
  })

  const username = useUsername(user)

  // Safe wallet integration
  const {
    currentAddress,
    currentContext,
    signerWallet,
    selectedSafeWallet,
    availableSafeWallets,
    switchToSafe,
    switchToEOA,
    isLoadingSafeWallets,
  } = useWallet()

  // Privy hooks (kept after refs/session/wallet for clarity; production path only)
  const { user: privyUser, getAccessToken } = usePrivy()
  const { login: privyLogin } = useLogin({
    onComplete: (params) => {
      onPrivyLogin(params.user)
    },
  })
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
      track("Successful Sign In", {
        userId: session.user.id,
        elementType: "auth",
        elementName: "Sign In",
      })

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
        track("Profile created", {
          userId: session.user.id,
          elementType: "auth",
          elementName: "Profile Creation",
        })
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
        <DropdownMenuTrigger className={`focus:outline-none focus:opacity-80`}>
          <div
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input ${"bg-background hover:bg-secondary"} h-10 px-4 py-2 gap-x-2.5 text-sm font-medium relative`}
          >
            <>
              <UserAvatar imageUrl={user?.imageUrl} size={"sm"} />

              {/* Wallet context indicator */}
              {currentContext === "SAFE" && availableSafeWallets.length > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                  title="Safe Wallet Active"
                />
              )}
              {currentContext === "EOA" && availableSafeWallets.length > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  title="EOA Wallet Active"
                />
              )}

              <span className="hidden sm:inline">
                {currentContext === "SAFE"
                  ? truncateAddress(
                      (currentAddress ||
                        selectedSafeWallet?.address ||
                        signerWallet?.address ||
                        "0x") as `0x${string}`,
                    )
                  : username}
              </span>
              <Image
                src="/assets/icons/arrowDownIcon.svg"
                width={10}
                height={6}
                alt=""
              />
            </>
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

          {/* Current EOA Wallet */}
          {availableSafeWallets.length > 0 && (
            <EOAWalletMenuItem
              currentContext={currentContext}
              signerWallet={signerWallet}
              switchToEOA={switchToEOA}
            />
          )}

          {/* Safe Wallets */}
          {availableSafeWallets.length > 0 && (
            <SafeWalletsMenuItems
              availableSafeWallets={availableSafeWallets}
              selectedSafeWallet={selectedSafeWallet}
              signerWallet={signerWallet}
              currentContext={currentContext}
              isLoadingSafeWallets={isLoadingSafeWallets}
              switchToSafe={switchToSafe}
            />
          )}
          <hr className="w-full border-[0.5px] border-border" />
          <ProfileMenuItem
            href="/profile/details"
            label="Account details"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/connected-apps"
            label="Connected apps"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/verified-addresses"
            label="Verified addresses"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/organizations/new"
            label="Organizations"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/citizenship"
            label="Citizen Registration"
            currentContext={currentContext}
          />
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
        className={`cursor-pointer text-sm text-primary-foreground leading-5 rounded-md px-2 sm:px-4 py-2.5 flex items-center justify-center h-10 w-max ${
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

export const Account = () => {
  // In test mode, render a simplified version that doesn't use Privy hooks
  if (isTestMode()) {
    return <TestModeAccount />
  }
  
  // In production mode, render the full component with Privy hooks
  return <AccountContent />
}

// Simplified account component for test mode
const TestModeAccount = () => {
  const isLinking = useRef(false)
  const isLoggingIn = useRef(false)

  const { data: session, status: authStatus } = useSession()
  const { user, invalidate: invalidateUser } = useUser({
    id: session?.user?.id || "",
    enabled: !!session?.user,
  })

  const username = useUsername(user)

  // Safe wallet integration
  const {
    currentAddress,
    currentContext,
    signerWallet,
    selectedSafeWallet,
    availableSafeWallets,
    switchToSafe,
    switchToEOA,
    isLoadingSafeWallets,
  } = useWallet()

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

  async function checkBadgeholderStatus() {
    if (!user || !isBadgeholder) return

    if (!hasShownWelcomeBadgeholderDialog()) {
      setOpenDialog("welcome_badgeholder")
      saveHasShownWelcomeBadgeholderDialog()
    }
  }

  const onPrivyLogin = (user: PrivyUser) => {
    isLoggingIn.current = true
    // Mock implementation for test mode
    Promise.resolve("mock-token")
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
      track("Successful Sign In", {
        userId: session.user.id,
        elementType: "auth",
        elementName: "Sign In",
      })

      const loginRedirect = localStorage.getItem(LOCAL_STORAGE_LOGIN_REDIRECT)
      if (loginRedirect) {
        localStorage.removeItem(LOCAL_STORAGE_LOGIN_REDIRECT)
        router.push(loginRedirect)
      } else if (!isMissionsPath) {
        router.refresh()
      }

      if (!isFirstTimeUser()) {
        checkBadgeholderStatus()
      } else {
        track("Profile created", {
          userId: session.user.id,
          elementType: "auth",
          elementName: "Profile Creation",
        })
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

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={`focus:outline-none focus:opacity-80`}>
          <div
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input ${"bg-background hover:bg-secondary"} h-10 px-4 py-2 gap-x-2.5 text-sm font-medium relative`}
          >
            <>
              <UserAvatar imageUrl={user?.imageUrl} size={"sm"} />

              {/* Wallet context indicator */}
              {currentContext === "SAFE" && availableSafeWallets.length > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                  title="Safe Wallet Active"
                />
              )}
              {currentContext === "EOA" && availableSafeWallets.length > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  title="EOA Wallet Active"
                />
              )}

              <span className="hidden sm:inline">
                {currentContext === "SAFE"
                  ? truncateAddress(
                      (currentAddress ||
                        selectedSafeWallet?.address ||
                        signerWallet?.address ||
                        "0x") as `0x${string}`,
                    )
                  : username}
              </span>
              <Image
                src="/assets/icons/arrowDownIcon.svg"
                width={10}
                height={6}
                alt=""
              />
            </>
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

          {/* Current EOA Wallet */}
          {availableSafeWallets.length > 0 && (
            <EOAWalletMenuItem
              currentContext={currentContext}
              signerWallet={signerWallet}
              switchToEOA={switchToEOA}
            />
          )}

          {/* Safe Wallets */}
          {availableSafeWallets.length > 0 && (
            <SafeWalletsMenuItems
              availableSafeWallets={availableSafeWallets}
              selectedSafeWallet={selectedSafeWallet}
              signerWallet={signerWallet}
              currentContext={currentContext}
              isLoadingSafeWallets={isLoadingSafeWallets}
              switchToSafe={switchToSafe}
            />
          )}
          <hr className="w-full border-[0.5px] border-border" />
          <ProfileMenuItem
            href="/profile/details"
            label="Profile details"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/connected-apps"
            label="Connected apps"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/verified-addresses"
            label="Verified addresses"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/profile/organizations/new"
            label="Organizations"
            currentContext={currentContext}
          />
          <ProfileMenuItem
            href="/citizenship"
            label="Citizen Registration"
            currentContext={currentContext}
          />
          <hr className="w-full border-[0.5px] border-border" />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              signOut()
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
        className={`cursor-pointer text-sm text-primary-foreground leading-5 rounded-md px-2 sm:px-4 py-2.5 flex items-center justify-center h-10 w-max ${
          isLoggingIn.current ? "bg-gray-300" : "bg-brand-primary"
        }`}
        onClick={() => {
          // Mock login for test mode
          onPrivyLogin({
            id: "test-user-123",
            email: { address: "test@example.com" },
            createdAt: new Date().toISOString(),
          } as any)
        }}
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
