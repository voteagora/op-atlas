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
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const WelcomeDialog = dynamic(() => import("../WelcomeDialog"))

const Navbar: React.FC = () => {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [error, setError] = useState(false)

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
    <nav className="bg-white p-6 flex justify-between items-center shadow-sm">
      <Image
        src="/assets/images/logo.svg"
        height={24}
        width={167}
        priority
        alt=""
      />
      <div className="flex items-center gap-x-4">
        <Image src="/assets/icons/moonIcon.svg" width={14} height={17} alt="" />
        <div className="w-[1px] bg-gray-300 h-6"></div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                className="gap-x-2.5 text-sm font-medium"
                variant="outline"
              >
                {" "}
                <Avatar className="!w-6 !h-6">
                  <AvatarImage src={session?.user?.image || ""} alt="avatar" />
                  <AvatarFallback>{session.user?.name}</AvatarFallback>
                </Avatar>{" "}
                {session.user?.name}
                <Image
                  src="/assets/icons/arrowDownIcon.svg"
                  width={10}
                  height={6}
                  alt=""
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
