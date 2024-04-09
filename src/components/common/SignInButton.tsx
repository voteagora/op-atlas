"use client"
import React from "react"
import { SignInButton as SignInBtn, UseSignInArgs } from "@farcaster/auth-kit"

type SignInButtonProps = UseSignInArgs & {
  onSignOut?: () => void
  debug?: boolean
  hideSignOut?: boolean
}

const SignInButton: React.FC = ({ ...props }: SignInButtonProps) => {
  return <SignInBtn {...props} />
}

export default React.memo(SignInButton)
