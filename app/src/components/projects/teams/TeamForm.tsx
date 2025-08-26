"use client"

import { User } from "@prisma/client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { Callout } from "@/components/common/Callout"
import { Button } from "@/components/ui/button"
import {
  addMembersToProject,
  removeMemberFromProject,
  setMemberRole,
  updateProjectDetails,
} from "@/lib/actions/projects"
import { useIsAdmin } from "@/lib/hooks"
import { ProjectTeam, ProjectWithFullDetails, TeamRole } from "@/lib/types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import AddTeamMemberDialog from "./AddTeamMemberDialog"
import ConfirmTeamCheckbox from "./ConfirmTeamCheckbox"
import DeleteTeamMemberDialog from "./DeleteTeamMemberDialog"
import { TeamMemberCard } from "./TeamMemberCard"

export default function AddTeamDetailsForm({
  project,
  team,
}: {
  project: ProjectWithFullDetails
  team: ProjectTeam
}) {
  const router = useRouter()
  const { data } = useSession()

  const currentUser = data?.user

  const [isTeamConfirmed, setIsTeamConfirmed] = useState(
    project.addedTeamMembers,
  )

  const isAdmin = useIsAdmin(team)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleNextClicked = async (isSave?: boolean) => {
    try {
      isSave ? setIsSaving(true) : setIsSubmitting(true)

      await updateProjectDetails(project.id, {
        addedTeamMembers: isTeamConfirmed,
      })
      toast.success("Project saved")

      // Both Save and Next buttons should advance to the next step
      router.push(`/projects/${project.id}/repos`)
    } catch (error) {
      console.error("Error updating project", error)
    } finally {
      setIsSaving(false)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-6">
          <h2>Contributors</h2>
          <p className="text-secondary-foreground">
            You can edit contributors here, and it won’t effect your
            organization’s settings. All contributors will have edit access to
            this project. Only project admins can delete the project or remove
            contributors.
          </p>
          <Callout
            type="info"
            text="Access to an admin account is needed to claim Retro Funding rewards"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-foreground text-sm font-medium">Contributors</p>
          {team.map(({ user, role, organizationId }) => (
            <TeamMemberCard
              key={user.id}
              user={user}
              organizationName={
                organizationId && project.organization?.organization.name
              }
              role={role as TeamRole}
              isUserAdmin={!!isAdmin}
              isCurrentUser={currentUser?.id === user.id}
              onToggleAdmin={() => handleToggleRole(user, role as TeamRole)}
              onRemove={() => setIsShowingRemove(user)}
            />
          ))}

          <Button
            onClick={() => {
              track("Add Collaborators", {
                elementType: "button",
                elementName: "Add contributors",
                projectId: project.id,
              })
              setIsShowingAdd(true)
            }}
            type="button"
            variant="secondary"
            className="w-fit font-medium"
          >
            <Plus size={16} className="mr-2.5" /> Add contributors
          </Button>
        </div>

        <ConfirmTeamCheckbox
          setIsTeamConfirmed={setIsTeamConfirmed}
          isTeamConfirmed={isTeamConfirmed}
        />

        <div className="flex gap-2">
          <Button
            isLoading={isSaving}
            onClick={() => handleNextClicked(true)}
            disabled={isSaving}
            type="button"
            variant="destructive"
            className="self-start"
          >
            Save
          </Button>
          <Button
            isLoading={isSubmitting}
            onClick={() => handleNextClicked()}
            disabled={isSubmitting}
            variant="secondary"
            className="w-fit"
          >
            Next
          </Button>
        </div>
      </div>

      <AddTeamMemberDialog
        open={isShowingAdd}
        onOpenChange={(open) => setIsShowingAdd(open)}
        team={team
          .filter((user) => user.organizationId && user.role === "admin")
          .map((member) => member.user)}
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
