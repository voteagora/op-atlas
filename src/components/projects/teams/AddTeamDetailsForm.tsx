"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IMultiSelectOptions } from "@/components/ui/multiselectautocomplete"
import { TeamMemberCard } from "./TeamMemberCard"
import { AddTeamMemberCard } from "./AddTeamMemberCard"
import { ConfirmTeamCheckbox } from "./ConfirmTeamCheckbox"
import AddTeamMemberDialogue from "./AddTeamMemberDialogue"

export default function AddTeamDetailsForm() {
  const [isTeamConfirmed, setIsTeamConfirmed] = React.useState(false)
  const [showAddTeamDialogue, setShowAddTeamDialogue] = React.useState(false)
  const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<
    IMultiSelectOptions[]
  >([])
  const [addedTeamMembers, setAddedTeamMembers] = React.useState<
    IMultiSelectOptions[]
  >([])

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Team
        </CardTitle>
        <CardDescription className="text-base font-normal text-text-secondary !mt-6">
          All team members will have edit access to this project. Only the
          project owner can delete the project, remove team members, or receive
          grants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-2 my-12">
          <TeamMemberCard
            name="Shaun Lind"
            username="shausome"
            avatarSrc="/assets/images/avatar.png"
            isOwner={true}
          />
          {addedTeamMembers.map((member) => (
            <TeamMemberCard
              key={member.value}
              name={member.label}
              username={member.value}
              avatarSrc={member.image}
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
          disabled={!isTeamConfirmed}
          variant="destructive"
          className="mt-12"
        >
          Next
        </Button>
        <AddTeamMemberDialogue
          setSelectedTeamMembers={setSelectedTeamMembers}
          selectedTeamMembers={selectedTeamMembers}
          open={showAddTeamDialogue}
          addedTeamMembers={addedTeamMembers}
          setAddedTeamMembers={setAddedTeamMembers}
          onOpenChange={(open) => setShowAddTeamDialogue(open)}
        />
      </CardContent>
    </div>
  )
}
