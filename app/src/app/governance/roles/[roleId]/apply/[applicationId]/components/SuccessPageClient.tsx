"use client"

import { Role } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useLayoutEffect } from "react"

import { Button } from "@/components/common/Button"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useConfetti } from "@/providers/LayoutProvider"

import { AnalyticsTracker } from "./AnalyticsTracker"
import { CopyForumTextButton } from "./CopyForumTextButton"
import { formatMMMd } from "@/lib/utils/date"

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
  const router = useRouter()
  const setShowConfetti = useConfetti()

  const isSecurityRole = role.isSecurityRole
  const avatarImageUrl = isUser ? user?.imageUrl : org?.avatarUrl
  const baseTextColor = isSecurityRole ? "text-foreground" : ""
  const handleViewRole = () => router.push(`/governance/roles/${role.id}`)
  const sharedIntro = (
    <>
      <UserAvatar imageUrl={avatarImageUrl} />
      <div className={`text-2xl font-normal text-center ${baseTextColor}`}>
        {"You're a candidate!"}
      </div>
      <div className={`text-lg text-center ${baseTextColor}`}>
        Your self-nomination for{" "}
        <span className="font-normal">{role.title}</span> was received.
      </div>
    </>
  )

  useLayoutEffect(() => {
    if (isSecurityRole) {
      setShowConfetti(true)
    }
  }, [isSecurityRole, setShowConfetti])

  if (isSecurityRole) {
    return (
      <main className="flex flex-col items-center justify-center h-full gap-8 w-full bg-foreground min-h-screen">
        <AnalyticsTracker role={role} />
        <div className="flex flex-col items-center justify-center gap-8 max-w-[712px] relative z-10">
          {sharedIntro}

          <div className="text-base text-center text-foreground leading-6">
            8 approvals from Top 100 Delegates are required to move on to the
            vote. Voting happens {formatMMMd(new Date(role.voteStartAt!))} -
            {formatMMMd(new Date(role.voteEndAt!))}.
          </div>

          <Button
            className="bg-brand-primary text-foreground px-4 py-2.5 rounded-md font-normal text-sm"
            onClick={handleViewRole}
            onKeyDown={(e) => e.key === "Enter" && handleViewRole()}
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
        {sharedIntro}
        <div className="text-lg font-normal text-center">Next Steps</div>
        <div className="flex flex-col gap-3 text-center items-center">
          <div className="font-normal text-center">Comment on the forum</div>
          <div className="text-center text-muted-foreground">{forumText}</div>
          <CopyForumTextButton
            forumText={forumText}
            forumLink={role.link || undefined}
          />
          <div className="text-sm text-muted-foreground">{role.link}</div>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="font-normal">Respond to questions</div>
          <div className="text-center text-muted-foreground">
            Keep an eye on the forum for questions from voters.
          </div>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <div className="font-normal">Voting happens soon</div>
          <div className="text-center text-muted-foreground">
            {voteSchedule}
          </div>
        </div>
      </div>
    </main>
  )
}
