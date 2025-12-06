"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Ban, Building2, ChevronLeft, ChevronRight, Copy, FolderGit, Loader2, Plus, Trash2, AlertCircle, RefreshCw, UserRound } from "lucide-react"
import { toast } from "sonner"
import { ProjectSearchAutocomplete } from "./ProjectSearchAutocomplete"
import { cn, copyToClipboard } from "@/lib/utils"
import { formatMMMdyyyy } from "@/lib/utils/date"

const PAGE_SIZE = 20

interface BlacklistEntry {
  id: string
  projectId: string
  reason: string | null
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    description: string | null
    thumbnailUrl: string | null
    createdAt: string
    organizationName: string | null
    admin: {
      id: string
      name: string | null
      username: string | null
      imageUrl: string | null
    } | null
  }
}

export function BlacklistManagement() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add to blacklist state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null)
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)

  // Remove from blacklist state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [projectToRemove, setProjectToRemove] = useState<BlacklistEntry | null>(null)
  const [removing, setRemoving] = useState(false)

  const fetchBlacklist = useCallback(async (pageNum: number = 0) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: PAGE_SIZE.toString(),
      })
      const response = await fetch(`/api/admin/blacklist?${params}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setBlacklist(data.blacklist)
        setTotalCount(data.totalCount)
        setPage(pageNum)
      } else {
        setError(data.error || 'Failed to fetch blacklist')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blacklist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlacklist(0)
  }, [fetchBlacklist])

  const handleSelectProject = (projectId: string, projectName: string) => {
    setSelectedProject({ id: projectId, name: projectName })
  }

  const handleAddToBlacklist = async () => {
    if (!selectedProject) return

    try {
      setAdding(true)
      const response = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          reason: reason.trim() || null,
        })
      })

      const data = await response.json()

      if (data.success) {
        setAddDialogOpen(false)
        setSelectedProject(null)
        setReason('')
        toast.success(`Project "${selectedProject.name}" added to blacklist`)
        // Refresh to first page to see the new entry
        await fetchBlacklist(0)
      } else {
        toast.error(data.error || 'Failed to add to blacklist')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to blacklist')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveFromBlacklist = async () => {
    if (!projectToRemove) return

    try {
      setRemoving(true)
      const response = await fetch('/api/admin/blacklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectToRemove.projectId,
        })
      })

      const data = await response.json()

      if (data.success) {
        const projectName = projectToRemove.project.name
        setRemoveDialogOpen(false)
        setProjectToRemove(null)
        toast.success(`Project "${projectName}" removed from blacklist`)
        // Refresh current page
        await fetchBlacklist(page)
      } else {
        toast.error(data.error || 'Failed to remove from blacklist')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove from blacklist')
    } finally {
      setRemoving(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasNextPage = page < totalPages - 1
  const hasPrevPage = page > 0

  if (loading && blacklist.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => fetchBlacklist(0)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blacklisted Projects</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'project' : 'projects'} currently blacklisted
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Plus className="h-4 w-4 mr-2" />
              Add to Blacklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Project to Blacklist</DialogTitle>
              <DialogDescription>
                Search for a project to add to the blacklist. Blacklisted projects may be restricted from certain features.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Project</label>
                {selectedProject ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FolderGit className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedProject.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <ProjectSearchAutocomplete
                    onSelectProject={handleSelectProject}
                    excludeBlacklisted={true}
                    placeholder="Search for a project..."
                    focusOnOpen={addDialogOpen}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  placeholder="Enter the reason for blacklisting this project..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false)
                  setSelectedProject(null)
                  setReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleAddToBlacklist}
                disabled={!selectedProject || adding}
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Add to Blacklist
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blacklist Table */}
      {blacklist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Ban className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No projects are currently blacklisted</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Project
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Blacklisted At</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {blacklist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.project.thumbnailUrl ? (
                            <img
                              src={entry.project.thumbnailUrl}
                              alt={entry.project.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <FolderGit className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{entry.project.name}</div>
                            {entry.project.organizationName && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {entry.project.organizationName}
                              </div>
                            )}
                            <button
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                              onClick={async () => {
                                await copyToClipboard(entry.projectId)
                                toast.success("Project ID copied")
                              }}
                              title={entry.projectId}
                            >
                              <span className="font-mono">{entry.projectId.slice(0, 8)}...</span>
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {entry.project.admin ? (
                          <div className="flex items-center gap-2">
                            {entry.project.admin.imageUrl ? (
                              <img
                                src={entry.project.admin.imageUrl}
                                alt={entry.project.admin.name || 'Admin'}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                <UserRound className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <div className="text-sm">
                              {entry.project.admin.name || entry.project.admin.username || 'Unknown'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No admin</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn(
                          "text-sm max-w-xs truncate",
                          entry.reason ? "text-foreground" : "text-muted-foreground italic"
                        )}>
                          {entry.reason || "No reason provided"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-muted-foreground">
                          {formatMMMdyyyy(new Date(entry.createdAt))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setProjectToRemove(entry)
                            setRemoveDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBlacklist(page - 1)}
                  disabled={!hasPrevPage || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBlacklist(page + 1)}
                  disabled={!hasNextPage || loading}
                >
                  Next
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Blacklist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{projectToRemove?.project.name}&quot; from the blacklist?
              This action can be undone by adding the project back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveDialogOpen(false)
                setProjectToRemove(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveFromBlacklist}
              disabled={removing}
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
