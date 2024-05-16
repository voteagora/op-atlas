"use client"

import { SignInButton, StatusAPIResponse } from "@farcaster/auth-kit"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import usePrevious from "@/lib/hooks"
import { isFirstTimeUser, saveLogInDate } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function Account() {
  const { data: session, status } = useSession()
  const previousAuthStatus = usePrevious(status)
  const [error, setError] = useState(false)
  const router = useRouter()
  const { setOpenDialog } = useAppDialogs()

  const logOut = useCallback(() => {
    signOut()
    router.push("/")
  }, [router])

  const handleSuccess = useCallback(
    async (res: StatusAPIResponse) => {
      const signInResponse = await signIn("credentials", {
        message: res.message,
        signature: res.signature,
        username: res.username,
        name: res.displayName,
        bio: res.bio,
        pfp: res.pfpUrl,
        nonce: res.nonce,
        redirect: false,
      })

      if (!signInResponse || signInResponse.error) {
        // Don't let farcaster sign in in this case
        logOut()
        setError(true)
        return
      }
    },
    [logOut],
  )

  useEffect(() => {
    // only run this useEffect when the user logs in
    if (
      !(status === "authenticated" && previousAuthStatus === "unauthenticated")
    )
      return

    if (isFirstTimeUser()) {
      router.push("/welcome")
      saveLogInDate()
    } else {
      saveLogInDate()
      router.push("/dashboard")

      if (!session.user.email) {
        setOpenDialog("email")
      }
    }
  }, [status, router, setOpenDialog, session, previousAuthStatus])

  useEffect(() => {
    if (error) {
      toast.error("Unable to sign in at this time.")
    }
  }, [error])

  if (status === "loading") {
    return null
  }

  {
    /* 
        The Farcaster AuthKitContext does not persist state across page reloads, so we must store and read 
        auth data from our own next-auth context.
    */
  }
  if (session)
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
        <DropdownMenuContent align="end" className="w-56">
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              View profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="cursor-pointer" onClick={logOut}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

  return (
    <SignInButton
      onSuccess={handleSuccess}
      onError={() => setError(true)}
      onSignOut={logOut}
    />
  )
}
