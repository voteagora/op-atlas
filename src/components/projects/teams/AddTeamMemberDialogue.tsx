"use client"
import { memo, useEffect } from "react"
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

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTeamMembers: IMultiSelectOptions[]
  setSelectedTeamMembers: React.Dispatch<
    React.SetStateAction<IMultiSelectOptions[]>
  >
  addedTeamMembers: IMultiSelectOptions[]
  setAddedTeamMembers: React.Dispatch<
    React.SetStateAction<IMultiSelectOptions[]>
  >
}

const options = [
  {
    value: "John",
    label: "@john",
    image: "/assets/images/ema.png",
  },
  {
    value: "@jane",
    label: "@jane",
    image: "/assets/images/emah.png",
  },
  {
    value: "@emma",
    label: "@emma",
    image: "/assets/images/emee.png",
  },
  {
    value: "@alex",
    label: "@alex",
    image: "/assets/images/emel.png",
  },
  {
    value: "@michael",
    label: "@michael",
    image: "/assets/images/emmy.png",
  },
  {
    value: "@sarah",
    label: "@sarah",
    image: "/assets/images/emmy.png",
  },
]

const AddTeamMemberDialogue: React.FC<IProps> = ({
  open,
  onOpenChange,
  selectedTeamMembers,
  setSelectedTeamMembers,
  addedTeamMembers,
  setAddedTeamMembers,
}) => {
  const handleButtonClick = () => {
    onOpenChange(false)
    setAddedTeamMembers(selectedTeamMembers)
  }

  useEffect(() => {
    setSelectedTeamMembers(addedTeamMembers)
  }, [addedTeamMembers, setSelectedTeamMembers])

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
