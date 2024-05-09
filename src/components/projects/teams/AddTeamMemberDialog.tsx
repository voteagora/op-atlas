"use client"

import { User } from "@prisma/client"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
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
  const [loading, setLoading] = useState(false)

  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<IMultiSelectOptions[]>([])

  const [debouncedSearchText] = useDebounceValue(searchText, 150)

  const onAddMembers = useCallback(async () => {
    try {
      setLoading(true)
      await addMembers(selectedUsers.map((user) => user.value.toString()))
    } catch (error) {
      console.error("Error adding team members", error)
    } finally {
      setLoading(false)
    }
  }, [addMembers, selectedUsers])

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
            You can add team members by their Farcaster username. Team members
            must have created a Retro Funding profile.
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
          disabled={!selectedUsers.length || loading}
          onClick={onAddMembers}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddTeamMemberDialog)
