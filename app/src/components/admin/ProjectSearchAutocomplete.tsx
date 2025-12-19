"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Building2, FolderGit, Loader2, Search, Trophy, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  organizationName: string | null
  isBlacklisted: boolean
  teamCount: number
  applicationCount: number
  rewardCount: number
}

interface Props {
  onSelectProject: (projectId: string, projectName: string) => void
  disabled?: boolean
  placeholder?: string
  excludeBlacklisted?: boolean
  focusOnOpen?: boolean
  loading?: boolean
  loadingText?: string
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

export function ProjectSearchAutocomplete({
  onSelectProject,
  disabled,
  placeholder,
  excludeBlacklisted = true,
  focusOnOpen,
  loading = false,
  loadingText
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [searching, setSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const searchProjects = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setProjects([])
        return
      }

      try {
        setSearching(true)
        const params = new URLSearchParams({
          q: searchQuery,
          ...(excludeBlacklisted ? { excludeBlacklisted: 'true' } : {})
        })
        const response = await fetch(`/api/admin/search-projects?${params}`)
        const data = await response.json()

        if (data.success) {
          setProjects(data.projects)
        } else {
          console.error('Search failed:', data.error)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setSearching(false)
      }
    }, 300),
    [excludeBlacklisted]
  )

  useEffect(() => {
    searchProjects(query)
  }, [query, searchProjects])

  const handleSelect = (project: Project) => {
    onSelectProject(project.id, project.name)
    setOpen(false)
    setQuery('')
    setProjects([])
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

  useEffect(() => {
    if (open && focusOnOpen && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [open, focusOnOpen])

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "justify-start w-full",
          disabled ? "opacity-70" : "",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {loadingText || placeholder || "Search projects..."}
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            {placeholder || "Search projects..."}
          </>
        )}
      </Button>
      {open && (
        <div className="absolute z-[360] mt-2 w-full max-h-[360px] overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef as any}
              placeholder="Search by project name or ID..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[18rem] overflow-y-auto">
              <CommandEmpty>
                {searching ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching</span>
                  </div>
                ) : query.length < 2 ? (
                  'Type at least 2 characters'
                ) : (
                  'No projects found'
                )}
              </CommandEmpty>
              <CommandGroup>
                {projects.map((project) => {
                  return (
                    <CommandItem
                      key={project.id}
                      value={project.id}
                      onSelect={() => handleSelect(project)}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {project.thumbnailUrl ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <FolderGit className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {project.name}
                          {project.isBlacklisted && (
                            <span className="ml-2 text-xs text-destructive">(blacklisted)</span>
                          )}
                        </div>
                        {project.organizationName && (
                          <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {project.organizationName}
                          </div>
                        )}
                        {project.description && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
                          </div>
                        )}
                        <div className="flex gap-3 mt-1.5 items-center flex-wrap">
                          {project.teamCount > 0 && (
                            <span
                              className="flex items-center gap-1 text-xs text-muted-foreground cursor-default"
                              title={`${project.teamCount} team ${project.teamCount === 1 ? 'member' : 'members'}`}
                            >
                              <Users className="h-3 w-3" />
                              {project.teamCount}
                            </span>
                          )}
                          {project.applicationCount > 0 && (
                            <span
                              className="flex items-center gap-1 text-xs text-muted-foreground cursor-default"
                              title={`${project.applicationCount} ${project.applicationCount === 1 ? 'application' : 'applications'}`}
                            >
                              <FolderGit className="h-3 w-3" />
                              {project.applicationCount}
                            </span>
                          )}
                          {project.rewardCount > 0 && (
                            <span
                              className="flex items-center gap-1 text-xs text-muted-foreground cursor-default"
                              title={`${project.rewardCount} ${project.rewardCount === 1 ? 'reward' : 'rewards'}`}
                            >
                              <Trophy className="h-3 w-3" />
                              {project.rewardCount}
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
