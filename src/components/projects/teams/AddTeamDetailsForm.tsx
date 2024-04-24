"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TeamMemberCard } from "./TeamMemberCard"
import { AddTeamMemberCard } from "./AddTeamMemberCard"
import { ConfirmTeamCheckbox } from "./ConfirmTeamCheckbox"
import AddTeamMemberDialogue from "./AddTeamMemberDialogue"
import DeleteTeamMemberDialogue from "./DeleteTeamMemberDialogue"
import { WarpcastBanner } from "./WarpcastBanner"

export interface IUser {
  id: number | string
  username: string
  profilePictureUrl: string
  fullName: string
}

export default function AddTeamDetailsForm() {
  const router = useRouter()
  const [isTeamConfirmed, setIsTeamConfirmed] = React.useState(false)
  const [showAddTeamDialogue, setShowAddTeamDialogue] = React.useState(false)

  const [addedTeamMembers, setAddedTeamMembers] = React.useState<IUser[]>([])
  const [openDialog, setOpenDialog] = React.useState(false)
  const [currentTeamMember, setCurrentTeamMember] =
    React.useState<IUser | null>(null)

  const handleOpenDialog = (member: IUser) => {
    setCurrentTeamMember(member)
    setOpenDialog(true)
  }

  const handleConfirmDelete = () => {
    setAddedTeamMembers(
      addedTeamMembers.filter((member) => member.id !== currentTeamMember?.id),
    )
    setOpenDialog(false)
  }

  const handleNextClicked = () => {
    router.push("/projects/new/repos")
  }

  return (
    <div>
      <CardHeader className="gap-6">
        <CardTitle className="text-foreground">Team</CardTitle>
        <CardDescription className="text-base font-normal text-text-secondary">
          All team members will have edit access to this project. Only the
          project owner can delete the project, remove team members, or receive
          grants.
        </CardDescription>
        <WarpcastBanner />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 my-12">
          <TeamMemberCard
            name="Shaun Lind"
            username="shausome"
            avatarSrc="/assets/images/avatar.png"
            isOwner
          />
          {addedTeamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.fullName}
              username={`@${member.username}`}
              avatarSrc={member.profilePictureUrl}
              onButtonClick={() => handleOpenDialog(member)}
            />
          ))}
          <AddTeamMemberCard
            onAddTeamBoxClicked={() => setShowAddTeamDialogue(true)}
          />
        </div>

        <ConfirmTeamCheckbox
          setIsTeamConfirmed={setIsTeamConfirmed}
          isTeamConfirmed={isTeamConfirmed}
        />
        <Button
          onClick={handleNextClicked}
          disabled={!isTeamConfirmed}
          variant="destructive"
          className="mt-12"
        >
          Next
        </Button>
        <AddTeamMemberDialogue
          open={showAddTeamDialogue}
          setAddedTeamMembers={setAddedTeamMembers}
          onOpenChange={(open) => setShowAddTeamDialogue(open)}
          addedTeamMembers={addedTeamMembers}
        />
        <DeleteTeamMemberDialogue
          open={openDialog}
          onOpenChange={(open) => setOpenDialog(open)}
          handleButtonClick={handleConfirmDelete}
          member={currentTeamMember}
        />
      </CardContent>
    </div>
  )
}
