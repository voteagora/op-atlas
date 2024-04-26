"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ProjectWithTeam, TeamRole } from "@/lib/types"
import {
  addMembersToProject,
  removeMemberFromProject,
  setMemberRole,
} from "@/lib/actions/projects"
import { TeamMemberCard } from "./TeamMemberCard"
import { AddTeamMemberCard } from "./AddTeamMemberCard"
import ConfirmTeamCheckbox from "./ConfirmTeamCheckbox"
import AddTeamMemberDialog from "./AddTeamMemberDialog"
import DeleteTeamMemberDialog from "./DeleteTeamMemberDialog"
import { WarpcastBanner } from "./WarpcastBanner"

export default function AddTeamDetailsForm({
  project,
}: {
  project: ProjectWithTeam
}) {
  const router = useRouter()
  const [team, setTeam] = useState(project.team)

  const [isTeamConfirmed, setIsTeamConfirmed] = useState(false)
  const [isShowingAdd, setIsShowingAdd] = useState(false)

  const [isShowingRemove, setIsShowingRemove] = useState<User | null>(null)

  const handleAddMembers = async (userIds: string[]) => {
    // TODO: Optimistic UI
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

  const handleNextClicked = () => {
    router.push("/projects/new/repos")
  }

  useEffect(() => {
    setTeam(project.team)
  }, [project.team])

  return (
    <>
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-6">
          <h2>Team</h2>
          <p className="text-secondary-foreground">
            All team members will have edit access to this project. Only the
            project owner can delete the project or remove team members.
          </p>
          <WarpcastBanner />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {team.map(({ user, role }) => (
            <TeamMemberCard
              key={user.id}
              user={user}
              role={role as TeamRole}
              onToggleAdmin={() => handleToggleRole(user, role as TeamRole)}
              onRemove={() => setIsShowingRemove(user)}
            />
          ))}
          <AddTeamMemberCard onClick={() => setIsShowingAdd(true)} />
        </div>

        <ConfirmTeamCheckbox
          setIsTeamConfirmed={setIsTeamConfirmed}
          isTeamConfirmed={isTeamConfirmed}
        />

        <Button
          onClick={handleNextClicked}
          disabled={!isTeamConfirmed}
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
