"use client"
import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  SignInButton,
  StatusAPIResponse,
  useProfile,
} from "@farcaster/auth-kit"
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useToast } from "../ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const WelcomeDialog = dynamic(() => import("../WelcomeDialog"))

const Navbar = () => {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [error, setError] = useState(false)

  {
    /* TODO: fetch nonce from backend server */
  }
  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken()
    if (!nonce) throw new Error("Unable to generate nonce")
    return nonce
  }, [])

  const handleSuccess = useCallback((res: StatusAPIResponse) => {
    signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false,
    })
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        title: "Unable to sign in at this time.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  return (
    <nav className="sticky inset-x-0 top-0 h-18 bg-white flex items-center justify-between px-6 shadow-sm z-20">
      <Image
        src="/assets/images/logo.svg"
        height={24}
        width={167}
        priority
        alt=""
      />
      <div className="flex items-center gap-x-4">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-x-2.5 text-sm font-medium">
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => signOut()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SignInButton
            nonce={getNonce}
            onSuccess={handleSuccess}
            onError={() => setError(true)}
            onSignOut={() => signOut()}
          />
        )}
      </div>
      <Dialog />
    </nav>
  )
}

function Dialog() {
  const { isAuthenticated } = useProfile()
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcomeDialog(true)
    }
  }, [isAuthenticated])

  return (
    <WelcomeDialog
      open={showWelcomeDialog}
      onOpenChange={(open) => setShowWelcomeDialog(open)}
      handleButtonClick={() => setShowWelcomeDialog(false)}
    />
  )
}

export default Navbar
