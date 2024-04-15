"use client"
import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { SignInButton, StatusAPIResponse } from "@farcaster/auth-kit"
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react"

import { useToast } from "../ui/use-toast"

import "@farcaster/auth-kit/styles.css"

const WelcomeDialog = dynamic(() => import("../WelcomeDialog"))

const Navbar = () => {
  const { toast } = useToast()
  const { data, status } = useSession()
  const [error, setError] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken()
    if (!nonce) throw new Error("Unable to generate nonce")
    return nonce
  }, [])

  const handleSuccess = useCallback(
    async (res: StatusAPIResponse) => {
      await signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        pfp: res.pfpUrl,
        redirect: false,
      })
      setShowWelcomeDialog(true)
    },
    [signIn],
  )

  useEffect(() => {
    if (error) {
      toast({
        title: "Unable to sign in at this time.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  return (
    <nav className="fixed inset-x-0 top-0 h-18 bg-white flex items-center justify-between px-6 shadow-sm z-20">
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
        <SignInButton
          nonce={getNonce}
          onSuccess={handleSuccess}
          onError={() => {
            setError(true)
          }}
          onSignOut={() => signOut()}
        />
      </div>
      <WelcomeDialog
        open={showWelcomeDialog}
        onOpenChange={(open) => setShowWelcomeDialog(open)}
        handleButtonClick={() => setShowWelcomeDialog(false)}
      />
    </nav>
  )
}

export default Navbar
