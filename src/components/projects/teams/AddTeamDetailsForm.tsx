"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TeamInfoCard } from "./TeamInfoCard"
import { AddTeamCard } from "./AddTeamCard"
import { ConfirmTeamCheckbox } from "./ConfirmTeamCheckbox"

export default function AddTeamDetailsForm() {
  const [isTeamConfirmed, setIsTeamConfirmed] = React.useState(false)
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
          <TeamInfoCard
            name="Shaun Lind"
            username="shausome"
            avatarSrc="/assets/images/avatar.png"
          />
          <AddTeamCard
            onAddTeamBoxClicked={() => console.log("hitting form")}
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
      </CardContent>
    </div>
  )
}
