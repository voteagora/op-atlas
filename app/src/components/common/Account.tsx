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

  const isSafeEnv =
    typeof window !== "undefined" &&
    !!(
      (window as any)?.ethereum?.isSafe ||
      (window as any)?.ethereum?.isGnosisSafe
    )

  // Robust detection: mark connected account as Safe if flag present or API confirms address is a Safe
  const [isSafeConnected, setIsSafeConnected] = useState(false)
  const [hasDetectedSafe, setHasDetectedSafe] = useState(false)
  const [savedPreferredContext, setSavedPreferredContext] = useState<
    "SAFE" | "EOA" | null
  >(null)
  const [isInitialResolving, setIsInitialResolving] = useState(true)
  const [isMenuReady, setIsMenuReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const detectSafe = async () => {
      if (isSafeEnv) {
        if (mounted) setIsSafeConnected(true)
        if (mounted) setHasDetectedSafe(true)
        return
      }
      if (signerWallet?.address) {
        // Prefer an on-chain bytecode check to avoid 404s against the Safe Tx Service for EOAs
        let connectedIsSafe = false
        try {
          const eip1193 =
            typeof window !== "undefined" ? (window as any)?.ethereum : null
          if (eip1193) {
            const browserProvider = new ethers.BrowserProvider(eip1193)
            connectedIsSafe = await safeService.isSafeWallet(
              signerWallet.address,
              browserProvider,
            )
          } else {
            const info = await safeService.getSafeInfoByAddress(
              signerWallet.address,
            )
            connectedIsSafe = !!info
          }
        } catch (_e) {
          connectedIsSafe = false
        }
        if (mounted) setIsSafeConnected(connectedIsSafe)
        if (mounted) setHasDetectedSafe(true)
      } else if (mounted) {
        setIsSafeConnected(false)
        setHasDetectedSafe(true)
      }
    }
    detectSafe()
    return () => {
      mounted = false
    }
  }, [isSafeEnv, signerWallet?.address])

  // Read preferred context saved from previous session
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("atlas_wallet_context")
    if (saved === "SAFE" || saved === "EOA") {
      setSavedPreferredContext(saved)
    } else {
      setSavedPreferredContext(null)
    }
  }, [])

  // Determine when initial wallet UI is resolved to avoid flicker and disable dropdown until then
  useEffect(() => {
    // Once ready, do not revoke readiness to avoid double spinner
    if (isMenuReady) return
    // Until detection and first list load complete, keep disabled
    if (!hasDetectedSafe || isLoadingSafeWallets) {
      setIsMenuReady(false)
      return
    }

    // Decide if we must resolve as SAFE (to avoid EOA flash) or EOA
    const mustResolveAsSafe =
      // If running inside Safe app, force SAFE to avoid spinner hanging waiting for API
      isSafeEnv ||
      savedPreferredContext === "SAFE" ||
      isSafeConnected

    const safeResolved =
      currentContext === "SAFE" &&
      (!!selectedSafeWallet ||
        availableSafeWallets.length > 0 ||
        // When inside Safe app, consider resolved once signer is known
        (isSafeEnv && !!signerWallet?.address))

    const eoaResolved = !!signerWallet?.address && !(isSafeEnv || isSafeConnected)

    const uiStableCandidate = mustResolveAsSafe ? safeResolved : eoaResolved

    if (!uiStableCandidate) {
      setIsMenuReady(false)
      return
    }

    // Arm readiness on the next frame so inner content has settled (prevents a one-frame flash)
    const raf = requestAnimationFrame(() => {
      setIsInitialResolving(false)
      setIsMenuReady(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [
    isMenuReady,
    hasDetectedSafe,
    isLoadingSafeWallets,
    savedPreferredContext,
    isSafeEnv,
    isSafeConnected,
    currentContext,
    selectedSafeWallet,
    availableSafeWallets.length,
    signerWallet?.address,
  ])

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
      try {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("atlas_wallet_context")
          window.localStorage.removeItem("atlas_selected_safe_address")
        }
      } catch (_) {}
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
        <DropdownMenuTrigger
          className={`focus:outline-none focus:opacity-80 ${
            !isMenuReady ? "pointer-events-none" : ""
          }`}
        >
          <div
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input ${
              !isMenuReady ? "bg-gray-300" : "bg-background hover:bg-secondary"
            } h-10 px-4 py-2 gap-x-2.5 text-sm font-medium relative`}
          >
            {!isMenuReady ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserAvatar imageUrl={user?.imageUrl} size={"sm"} />

                {/* Wallet context indicator */}
                {currentContext === "SAFE" && (
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                    title="Safe Wallet Active"
                  />
                )}
                {currentContext === "EOA" && (
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
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 flex flex-col gap-1 z-[9999]"
        >
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              Dashboard
            </DropdownMenuItem>
          </Link>

          {/* Current EOA Wallet */}
          {(() => {
            // Hide EOA only when the CONNECTED account is a Safe (Safe app or signer equals Safe)
            // Hide EOA when in Safe App env, or when API confirms connected is a Safe,
            // or when signer matches the last persisted Safe address
            const lastSafe =
              typeof window !== "undefined"
                ? window.localStorage.getItem("atlas_selected_safe_address")
                : null
            const signerIsPersistedSafe = !!(
              lastSafe &&
              signerWallet?.address &&
              lastSafe.toLowerCase() === signerWallet.address.toLowerCase()
            )
            const shouldHideEOA =
              isSafeEnv || isSafeConnected || signerIsPersistedSafe

            if (shouldHideEOA) return null

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
          })()}

          {/* Safe Wallets */}
          {(() => {
            const safesToRender = (() => {
              if (availableSafeWallets.length > 0) return availableSafeWallets
              if (selectedSafeWallet) return [selectedSafeWallet]
              if (isSafeConnected && signerWallet?.address)
                return [{ address: signerWallet.address }] as any
              // Persisted last-safe fallback to avoid disappearing block
              if (typeof window !== "undefined") {
                const last = window.localStorage.getItem(
                  "atlas_selected_safe_address",
                )
                if (last) return [{ address: last }] as any
              }
              return []
            })()

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
          })()}

          <DropdownMenuSeparator />
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
