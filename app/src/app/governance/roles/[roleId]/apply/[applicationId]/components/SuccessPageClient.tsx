"use client"

import { Role } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useLayoutEffect, useState } from "react"
import Confetti from "react-dom-confetti"

import { Button } from "@/components/common/Button"
import { UserAvatar } from "@/components/common/UserAvatar"

import { AnalyticsTracker } from "./AnalyticsTracker"
import { CopyForumTextButton } from "./CopyForumTextButton"

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 10000,
  stagger: 3,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
}

interface SuccessPageClientProps {
  role: Role
  isUser: boolean
  user?: {
    imageUrl?: string | null
  } | null
  org?: {
    avatarUrl?: string | null
  } | null
  forumText: string
  voteSchedule: string
}

export const SuccessPageClient = ({
  role,
  isUser,
  user,
  org,
  forumText,
  voteSchedule,
}: SuccessPageClientProps) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  const isSecurityRole =
    role.title.includes("Security") || role.title.includes("security")

  useLayoutEffect(() => {
    if (isSecurityRole) {
      setShowConfetti(true)
    }
  }, [isSecurityRole])

  if (isSecurityRole) {
    return (
      <main className="flex flex-col items-center justify-center h-full gap-8 w-full bg-foreground min-h-screen">
        <AnalyticsTracker role={role} />

        {/* Confetti Background */}
        <div className="fixed inset-0 pointer-events-none top-0">
          <Confetti active={showConfetti} config={confettiConfig} />
        </div>

        <div className="flex flex-col items-center justify-center gap-8 max-w-[712px] relative z-10">
          {isUser ? (
            <UserAvatar imageUrl={user?.imageUrl} />
          ) : (
            <UserAvatar imageUrl={org?.avatarUrl} />
          )}

          <div className="text-2xl font-semibold text-center text-foreground">
            {"You're a candidate!"}
          </div>

          <div className="text-lg text-center text-foreground">
            Your self-nomination for{" "}
            <span className="font-semibold">{role.title}</span> was received.
          </div>

          <div className="text-base text-center text-foreground leading-6">
            8 approvals from Top 100 Delegates are required to move on to the
            vote. Voting happens Oct 16 – Oct 22.
          </div>

          <Button
            className="bg-brand-primary text-foreground px-4 py-2.5 rounded-md font-medium text-sm"
            onClick={() => router.push(`/governance/roles/${role.id}`)}
            onKeyDown={(e) =>
              e.key === "Enter" && router.push(`/governance/roles/${role.id}`)
            }
          >
            View role
          </Button>
        </div>
      </main>
    )
  }

  // Standard role success page
  return (
    <main className="flex flex-col items-center justify-center h-full gap-8 w-full">
      <AnalyticsTracker role={role} />
      <div className="flex flex-col items-center justify-center gap-8 max-w-[712px] mt-20">
        {isUser ? (
          <UserAvatar imageUrl={user?.imageUrl} />
        ) : (
          <UserAvatar imageUrl={org?.avatarUrl} />
        )}
        <div className="text-2xl font-semibold text-center">
          {"You're a candidate!"}
        </div>
        <div className="text-lg text-center">
          Your self-nomination for{" "}
          <span className="font-semibold">{role.title}</span> was received.
        </div>
        <div className="text-lg font-semibold text-center">Next Steps</div>
        <div className="flex flex-col gap-3 text-center items-center">
          <div className="font-semibold text-center">Comment on the forum</div>
          <div className="text-center text-muted-foreground">{forumText}</div>
          <CopyForumTextButton
            forumText={forumText}
            forumLink={role.link || undefined}
          />
          <div className="text-sm text-muted-foreground">{role.link}</div>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="font-semibold">Respond to questions</div>
          <div className="text-center text-muted-foreground">
            Keep an eye on the forum for questions from voters.
          </div>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="font-semibold">Voting happens soon</div>
          <div className="text-center text-muted-foreground">
            {voteSchedule}
          </div>
        </div>
      </div>
    </main>
  )
}
