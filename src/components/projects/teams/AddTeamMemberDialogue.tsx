"use client"
import { memo, useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  IMultiSelectOptions,
  MultiSelect,
} from "@/components/ui/multiselectautocomplete"
import { Button } from "@/components/ui/button"
import users from "@/dummyData/user.json"
import { IUser } from "./AddTeamDetailsForm"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addedTeamMembers: IUser[]
  setAddedTeamMembers: React.Dispatch<React.SetStateAction<IUser[]>>
}

const AddTeamMemberDialogue: React.FC<IProps> = ({
  open,
  onOpenChange,
  addedTeamMembers,
  setAddedTeamMembers,
}) => {
  /**
   * State to store the selected team members.
   */
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<
    IMultiSelectOptions[]
  >([])

  /**
   * Handles the button click event.
   * Closes the dialog and updates the added team members.
   */
  const handleButtonClick = () => {
    onOpenChange(false)
    setAddedTeamMembers(
      selectedTeamMembers.map(
        (member) => users.find((user) => user.id === member.value) as IUser,
      ),
    )
  }

  /**
   * Generates the options for the multi-select component.
   * Maps the users array to an array of options with label, value, and image properties.
   */
  const options = useMemo(() => {
    return users.map((user) => ({
      label: `@${user.username}`,
      value: user.id,
      image: user.profilePictureUrl,
    }))
  }, [])

  /**
   * Updates the selected team members when the dialog is opened.
   * Maps the added team members to options with label, value, and image properties.
   */
  useEffect(() => {
    if (open) {
      setSelectedTeamMembers(
        addedTeamMembers.map((member) => ({
          label: `@${member.username}`,
          value: member.id,
          image: member.profilePictureUrl,
        })),
      )
    }
  }, [addedTeamMembers, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Add team members
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
            Team members must have a Farcaster account.
          </DialogDescription>
        </DialogHeader>
        <MultiSelect
          selectedOptions={selectedTeamMembers}
          setSelectedOptions={setSelectedTeamMembers}
          placeholder="@username"
          options={options}
        />
        <Button
          disabled={!selectedTeamMembers.length}
          className="w-full disabled:opacity-1"
          variant="destructive"
          onClick={handleButtonClick}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddTeamMemberDialogue)
