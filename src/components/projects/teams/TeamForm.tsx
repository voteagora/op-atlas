"use client"

import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { sortBy } from "ramda"
import { useEffect, useState } from "react"

import { Callout } from "@/components/common/Callout"
import { Button } from "@/components/ui/button"
import {
  addMembersToProject,
  removeMemberFromProject,
  setMemberRole,
  updateProjectDetails,
} from "@/lib/actions/projects"
import { useIsAdmin } from "@/lib/hooks"
import { ProjectWithDetails, TeamRole } from "@/lib/types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { AddTeamMemberCard } from "./AddTeamMemberCard"
import AddTeamMemberDialog from "./AddTeamMemberDialog"
import ConfirmTeamCheckbox from "./ConfirmTeamCheckbox"
import DeleteTeamMemberDialog from "./DeleteTeamMemberDialog"
import { TeamMemberCard } from "./TeamMemberCard"

export default function AddTeamDetailsForm({
  project,
}: {
  project: ProjectWithDetails
}) {
  const router = useRouter()
  const [team, setTeam] = useState(
    sortBy((member) => member.user.name?.toLowerCase() ?? "", project.team),
  )

  const [isTeamConfirmed, setIsTeamConfirmed] = useState(
    project.addedTeamMembers,
  )

  const isAdmin = useIsAdmin(project)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShowingAdd, setIsShowingAdd] = useState(false)
  const [isShowingRemove, setIsShowingRemove] = useState<User | null>(null)

  const { track } = useAnalytics()

  const handleAddMembers = async (userIds: string[]) => {
    // TODO: Optimistic UI
    // TODO: Analytics to track adding team members by farcasterId
    await addMembersToProject(project.id, userIds)
    setIsShowingAdd(false)
  }

  const handleToggleRole = async (user: User, role: TeamRole) => {
    // TODO: Optimistic UI
    const newRole = role === "member" ? "admin" : "member"
    await setMemberRole(project.id, user.id, newRole)
  }

  const handleConfirmDelete = async () => {
    if (!isShowingRemove) return

    // TODO: Optimistic UI
    await removeMemberFromProject(project.id, isShowingRemove.id)
    setIsShowingRemove(null)
  }

  const handleNextClicked = async () => {
    try {
      setIsSubmitting(true)
      await updateProjectDetails(project.id, { addedTeamMembers: true })
      router.push(`/projects/${project.id}/repos`)
    } catch (error) {
      console.error("Error updating project", error)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setTeam(
      sortBy((member) => member.user.name?.toLowerCase() ?? "", project.team),
    )
  }, [project.team])

  return (
    <>
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-6">
          <h2>Team</h2>
          <p className="text-secondary-foreground">
            All team members will have edit access to this project. Only project
            admins can delete the project or remove team members.
          </p>
          <Callout
            type="info"
            text="Access to an admin account is needed to claim Retro Funding rewards"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {team.map(({ user, role }) => (
            <TeamMemberCard
              key={user.id}
              user={user}
              role={role as TeamRole}
              isUserAdmin={!!isAdmin}
              onToggleAdmin={() => handleToggleRole(user, role as TeamRole)}
              onRemove={() => setIsShowingRemove(user)}
            />
          ))}
          <AddTeamMemberCard
            onClick={() => {
              track("Add Collaborators")
              setIsShowingAdd(true)
            }}
          />
        </div>

        <ConfirmTeamCheckbox
          setIsTeamConfirmed={setIsTeamConfirmed}
          isTeamConfirmed={isTeamConfirmed}
        />

        <Button
          isLoading={isSubmitting}
          onClick={handleNextClicked}
          disabled={!isTeamConfirmed || isSubmitting}
          variant="destructive"
          className="w-fit"
        >
          Next
        </Button>
      </div>

      <AddTeamMemberDialog
        open={isShowingAdd}
        onOpenChange={(open) => setIsShowingAdd(open)}
        team={team.map((member) => member.user)}
        addMembers={handleAddMembers}
      />
      <DeleteTeamMemberDialog
        open={!!isShowingRemove}
        onOpenChange={() => setIsShowingRemove(null)}
        onRemove={handleConfirmDelete}
        member={isShowingRemove}
      />
    </>
  )
}
