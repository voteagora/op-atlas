"use client"
import { SignInButton } from "@farcaster/auth-kit"

const Header = () => {
  return (
    <div id="header" className="flex items-center justify-between w-full p-4">
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 text-white bg-black">
          <SignInButton />
        </div>
      </div>
    </div>
  )
}

export default Header
