"use client"

import { useDebounceValue } from "usehooks-ts"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { User } from "@prisma/client"
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
import { DialogProps } from "@/components/dialogs/types"
import { searchUsers } from "@/lib/actions/users"

type Props = DialogProps<{
  team: User[]
}> & {
  addMembers: (userIds: string[]) => Promise<void>
}

const AddTeamMemberDialog = ({
  open,
  onOpenChange,
  team,
  addMembers,
}: Props) => {
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<IMultiSelectOptions[]>([])

  const [debouncedSearchText] = useDebounceValue(searchText, 100)

  const onAddMembers = useCallback(async () => {
    try {
      await addMembers(selectedUsers.map((user) => user.value.toString()))
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding team members", error)
    }
  }, [addMembers, selectedUsers, onOpenChange])

  const options = useMemo(() => {
    const selectedUserIds = [
      ...team.map((user) => user.id),
      ...selectedUsers.map((user) => user.value),
    ]

    return searchResults
      .filter((user) => !selectedUserIds.includes(user.id))
      .map((user) => ({
        label: `@${user.username}`,
        value: user.id,
        image: user.imageUrl,
      }))
  }, [searchResults, selectedUsers, team])

  useEffect(() => {
    if (debouncedSearchText === "") {
      setSearchResults([])
      return
    }

    async function search() {
      try {
        const result = await searchUsers(debouncedSearchText)
        if (result.users) {
          setSearchResults(result.users)
        }
      } catch (error) {
        console.error("Error searching users", error)
      }
    }

    if (open) {
      search()
    }
  }, [debouncedSearchText, open])

  // Clear state after closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSearchText("")
        setSelectedUsers([])
      }, 500)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Add team members
          </DialogTitle>
          <DialogDescription className="text-center text-base text-secondary-foreground font-normal mt-1">
            Team members must have a Farcaster account.
          </DialogDescription>
        </DialogHeader>
        <MultiSelect
          parentClassName="z-10"
          selectedOptions={selectedUsers}
          setSelectedOptions={setSelectedUsers}
          placeholder="@username"
          options={options}
          inputValue={searchText}
          setInputValue={setSearchText}
        />
        <Button
          className="w-full"
          variant="destructive"
          disabled={!selectedUsers.length}
          onClick={onAddMembers}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddTeamMemberDialog)
