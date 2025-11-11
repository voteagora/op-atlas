"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge, BriefcaseBusiness, FileText, Search, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string | null
  username: string | null
  imageUrl: string | null
  email?: string
  projectCount: number
  organizationCount: number
  hasApplications: boolean
  isCitizen: boolean
}

interface Props {
  onSelectUser: (userId: string) => void
  disabled?: boolean
  placeholder?: string
  currentUserId?: string
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function UserSearchAutocomplete({
  onSelectUser,
  disabled,
  placeholder,
  currentUserId
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const searchUsers = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }

      try {
        setLoading(true)
        const response = await fetch(
          `/api/admin/search-users?q=${encodeURIComponent(searchQuery)}`
        )
        const data = await response.json()

        if (data.success) {
          setUsers(data.users)
        } else {
          console.error('Search failed:', data.error)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    searchUsers(query)
  }, [query, searchUsers])

  const handleSelect = (userId: string) => {
    onSelectUser(userId)
    setOpen(false)
    setQuery('')
    setUsers([])
  }

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (
        open &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "justify-start w-full sm:w-[260px] min-w-0",
          disabled ? "opacity-70" : "",
        )}
      >
        <Search className="h-4 w-4 mr-2" />
        {placeholder || "Search users..."}
      </Button>
      {open && (
        <div className="absolute z-[360] mt-2 w-full sm:w-[420px] max-h-[360px] overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name, username, email, or ID..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[18rem] overflow-y-auto">
              <CommandEmpty>
                {loading ? 'Searching...' : query.length < 2 ? 'Type at least 2 characters' : 'No users found'}
              </CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUserId
                  const displayName = user.name || user.username || 'Unnamed User'

                  return (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => !isCurrentUser && handleSelect(user.id)}
                      disabled={isCurrentUser}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                    >
                    <div className="flex-shrink-0">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {displayName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(current)</span>
                        )}
                      </div>
                      {user.username && user.username !== user.name && (
                        <div className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </div>
                      )}
                      {user.email && (
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        {user.projectCount > 0 && (
                          <span className="flex items-center gap-1">
                            <BriefcaseBusiness className="h-3 w-3" />
                            {user.projectCount}
                          </span>
                        )}
                        {user.organizationCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {user.organizationCount}
                          </span>
                        )}
                        {user.isCitizen && (
                          <span className="flex items-center gap-1">
                            <Badge className="h-3 w-3" />
                            Citizen
                          </span>
                        )}
                      </div>
                    </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
