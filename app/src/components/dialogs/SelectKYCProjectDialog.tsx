"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useSession } from "next-auth/react"
import React from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getAdminProjects, getProjects } from "@/lib/actions/projects"
import { createProjectKYCTeamsAction } from "@/lib/actions/projects"
import { useAppDialogs } from "@/providers/DialogProvider"

import { DialogProps } from "./types"

export default function SelectKYCProjectDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const queryClient = useQueryClient()
  const session = useSession()
  const {
    data: { kycTeamId, alreadySelectedProjectIds },
  } = useAppDialogs()
  const {
    data: projects,
    isLoading: projectsLoading,
    isPending: projectsPending,
  } = useQuery({
    queryKey: ["userProjects"],
    queryFn: async () => {
      if (!session.data?.user.id) return []
      return (await getAdminProjects(session.data.user.id)).filter(
        (project) =>
          Boolean(project.organization) &&
          !alreadySelectedProjectIds?.includes(project.id),
      )
    },
  })
  const { mutate: createProjectKYCTeams, isPending } = useMutation({
    mutationKey: ["createProjectKYCTeams"],
    mutationFn: async (projectIds: string[]) => {
      if (!kycTeamId || projectIds.length === 0) return
      await createProjectKYCTeamsAction({ projectIds, kycTeamId })
      await queryClient.invalidateQueries({
        queryKey: ["kycTeamProjects", kycTeamId],
      })
      toast.success("Projects added successfully")
      onOpenChange(false)
    },
  })

  const [selectedProjectIds, setSelectedProjectIds] = React.useState<string[]>(
    [],
  )

  if (projectsLoading || projectsPending) {
    return (
      <Dialog open>
        <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
          <DialogTitle className="text-center leading-7 font-semibold text-xl">
            Choose the projects that will use this grant delivery address
          </DialogTitle>
          <div className="space-y-6 z-50 w-full h-full">
            <div className="w-full space-y-2">
              <div className="w-full h-10 rounded-md animate-pulse bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="rounded-md h-10 bg-gray-200 animate-pulse w-full" />
              <div className="rounded-md h-10 bg-gray-200 animate-pulse w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        {projects?.length !== 0 && (
          <DialogTitle className="text-center leading-7 font-semibold text-xl">
            Choose the projects that will use this grant delivery address
          </DialogTitle>
        )}
        {projects?.length === 0 ? (
          <span className="text-sm text-secondary-foreground">
            No projects left unselected
          </span>
        ) : (
          <>
            <ul className="space-y-2 w-full">
              {projects?.map((project, i) => (
                <li
                  key={`${project.id} - ${i}`}
                  className="input-container space-x-2 text-sm text"
                >
                  <Checkbox
                    className="w-5 h-5"
                    onCheckedChange={() => {
                      setSelectedProjectIds((prev) =>
                        prev.includes(project.id)
                          ? prev.filter((id) => id !== project.id)
                          : [...prev, project.id],
                      )
                    }}
                  />
                  {project.thumbnailUrl && (
                    <Image
                      src={project.thumbnailUrl}
                      width={24}
                      height={24}
                      alt={project.name}
                    />
                  )}
                  <span className="text-sm font-normal">{project.name}</span>
                </li>
              ))}
            </ul>
            <div className="w-full space-y-2">
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  createProjectKYCTeams(selectedProjectIds)
                }}
              >
                Submit
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
