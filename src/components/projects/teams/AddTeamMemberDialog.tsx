"use client"

import { User } from "@prisma/client"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import { DialogProps } from "@/components/dialogs/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useAnalytics } from "@/providers/AnalyticsProvider"

type Props = DialogProps<{
  team: User[]
  avatar?: string
  onSkip?: () => void
}> & {
  addMembers: (userIds: string[]) => Promise<void>
}

const AddTeamMemberDialog = ({
  open,
  onOpenChange,
  team,
  addMembers,
  avatar,
  onSkip,
}: Props) => {
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)

  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<IMultiSelectOptions[]>([])

  const [debouncedSearchText] = useDebounceValue(
    searchText.startsWith("@") ? searchText.substring(1) : searchText,
    150,
  )

  const { track } = useAnalytics()
  const onAddMembers = useCallback(async () => {
    try {
      setLoading(true)
      await addMembers(selectedUsers.map((user) => user.value.toString()))
      track("Add Collaborators", {
        userIds: selectedUsers.map((user) => user.farcasterId),
      })
    } catch (error) {
      console.error("Error adding team members", error)
    } finally {
      setLoading(false)
    }
  }, [addMembers, selectedUsers, track])

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
        farcasterId: user.farcasterId,
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
          {avatar && (
            <Avatar className="!w-20 !h-20 mx-auto">
              <AvatarImage src={avatar || ""} alt="avatar" />
              <AvatarFallback>{avatar}</AvatarFallback>
            </Avatar>
          )}
          <DialogTitle className="text-center text-lg font-semibold">
            Add team members
          </DialogTitle>
          <DialogDescription className="text-center text-base text-secondary-foreground font-normal mt-1">
            You can add team members by their Farcaster username. Team members
            must have an Optimist profile.
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
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full"
            variant="destructive"
            disabled={!selectedUsers.length || loading}
            onClick={onAddMembers}
          >
            Add
          </Button>
          {onSkip && (
            <Button className="w-full" variant="outline" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddTeamMemberDialog)
