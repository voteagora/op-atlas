import { notFound } from "next/navigation"

import { AnalyticsTracker } from "@/app/governance/roles/[roleId]/apply/[applicationId]/components/AnalyticsTracker"
import { CopyForumTextButton } from "@/app/governance/roles/[roleId]/apply/[applicationId]/components/CopyForumTextButton"
import { UserAvatar } from "@/components/common/UserAvatar"
import { getOrganization } from "@/db/organizations"
import { getRoleApplicationById, getRoleById } from "@/db/role"
import { getUserById } from "@/db/users"
import { formatMMMd } from "@/lib/utils/date"

export default async function Page({
  params,
}: {
  params: { roleId: string; applicationId: string }
}) {
  const [role, application] = await Promise.all([
    getRoleById(parseInt(params.roleId)),
    getRoleApplicationById(parseInt(params.applicationId)),
  ])

  if (!role || !application) {
    notFound()
  }

  const isUser = application?.userId
  let user = null
  let org = null

  if (isUser) {
    user = await getUserById(application.userId!)
  } else {
    org = await getOrganization({ id: application?.organizationId! })
  }

  const forumText = `I'm a candidate for ${
    role.title
  }. Check out my qualifications here: https://atlas.optimism.io/${
    isUser ? user?.username : org?.id
  }`

  const voteSchedule =
    role?.voteStartAt && role?.voteEndAt
      ? `Delegates can vote from ${formatMMMd(
          new Date(role.voteStartAt!),
        )} - ${formatMMMd(new Date(role.voteEndAt!))}`
      : ""

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
