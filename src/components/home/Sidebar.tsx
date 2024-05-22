"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { clickSignInWithFarcasterButton } from "@/lib/utils"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

export const Sidebar = ({ className }: { className?: string }) => {
  const { status } = useSession()
  const router = useRouter()

  const onClickGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else {
      clickSignInWithFarcasterButton()
    }
  }

  return (
    <div className={cn("flex flex-col gap-y-12", className)}>
      <div className="flex flex-col items-center gap-y-4 p-6 border border-[#D6E4FF] bg-[#F0F4FF] rounded-3xl">
        <div className="flex items-center justify-center rounded-full bg-[#D6E4FF] px-2 py-0.5">
          <p className="text-xs font-semibold text-[#3374DB]">New</p>
        </div>

        <div className="h-20 w-20 flex items-center justify-center rounded-full border border-dashed border-[#3374DB] bg-[#D6E4FF]">
          <Image
            alt="empty profile"
            src="/assets/icons/star-face.svg"
            width={42}
            height={19}
          />
        </div>

        <p className="text-sm font-semibold text-center">Optimist Profiles</p>
        <p className="text-sm text-muted-foreground text-center">
          Create your profile, add projects, and apply for Retro Funding.
        </p>

        <Button onClick={onClickGetStarted} variant="outline" className="mt-5">
          Get started
        </Button>
      </div>

      <div className="flex flex-col items-center gap-y-4 px-6">
        <Image
          alt="Sunny"
          src="/assets/icons/sunny.png"
          height={80}
          width={80}
        />

        <p className="text-sm font-semibold text-center font-mono">
          40,00,000 OP
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Retro Funding rewarded to Optimism Collective contributors since 2022
        </p>
      </div>
    </div>
  )
}
