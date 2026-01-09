import { redirect } from "next/navigation"

import { FeedbackButton } from "@/components/common/FeedbackButton"
import Dashboard from "@/components/dashboard"
import { getUserById } from "@/db/users"
import { getUserKycTeams } from "@/db/kyc"
import { getCitizenSeasonByUser } from "@/db/citizenSeasons"
import { getUserKYCStatus } from "@/lib/actions/userKyc"
import { getUserOrganizations } from "@/lib/actions/organizations"
import {
  getAdminProjects,
  getApplications,
  getProjects,
} from "@/lib/actions/projects"
import { getActiveSeason } from "@/lib/seasons"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const metadata = {
  title: "Dashboard - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const { session, db, userId } = await getImpersonationContext()

  if (!userId) {
    redirect("/")
  }

  const [
    user,
    projects,
    applications,
    organizations,
    adminProjects,
    kycTeams,
    userKYCStatus,
    activeSeason,
  ] =
    await Promise.all([
      getUserById(userId, db, session),
      getProjects(userId),
      getApplications(userId),
      getUserOrganizations(userId),
      getAdminProjects(userId),
      getUserKycTeams(userId),
      getUserKYCStatus(userId),
      getActiveSeason(),
    ])

  if (!user) {
    redirect("/")
  }

  let showCitizenReRegistrationCallout = false
  let reRegistrationSeasonName: string | undefined

  if (activeSeason) {
    reRegistrationSeasonName = activeSeason.name

    const previousSeasonNumber = Number(activeSeason.id) - 1
    const previousSeasonId =
      Number.isFinite(previousSeasonNumber) && previousSeasonNumber > 0
        ? String(previousSeasonNumber)
        : null

    const [currentCitizenSeason, previousCitizenSeason] = await Promise.all([
      getCitizenSeasonByUser({
        seasonId: activeSeason.id,
        userId,
      }),
      previousSeasonId
        ? getCitizenSeasonByUser({
            seasonId: previousSeasonId,
            userId,
          })
        : Promise.resolve(null),
    ])

    showCitizenReRegistrationCallout =
      !currentCitizenSeason && Boolean(previousCitizenSeason)
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <Dashboard
        user={user}
        projects={projects}
        applications={applications}
        organizations={organizations}
        adminProjects={adminProjects}
        kycTeams={kycTeams}
        userKYCStatus={userKYCStatus}
        showCitizenReRegistrationCallout={showCitizenReRegistrationCallout}
        reRegistrationSeasonName={reRegistrationSeasonName}
        className="w-full max-w-4xl"
      />
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
    </main>
  )
}
