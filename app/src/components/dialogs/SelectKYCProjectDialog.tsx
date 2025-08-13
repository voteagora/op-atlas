"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import React from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getAdminProjects } from "@/lib/actions/projects"
import {
  createProjectKYCTeamsAction,
  deleteProjectKYCTeamsAction,
} from "@/lib/actions/projects"
import { useAppDialogs } from "@/providers/DialogProvider"

import { DialogProps } from "./types"

export default function SelectKYCProjectDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const queryClient = useQueryClient()

  const session = useSession()

  const { organizationId } = useParams()

  const {
    data: { kycTeamId, alreadySelectedProjectIds },
  } = useAppDialogs()

  const {
    data: projects,
    isLoading: projectsLoading,
    isPending: projectsPending,
  } = useQuery({
    queryKey: ["userProjects", organizationId],
    queryFn: async () => {
      if (!session.data?.user.id) return []
      const allProjects = (await getAdminProjects(session.data.user.id)).filter(
        (project) => project.organization?.organization?.id === organizationId,
      )

      return allProjects
    },
  })

  // Filter projects that can be assigned to KYC teams (no active reward streams)
  const availableProjects = React.useMemo(() => {
    if (!projects) return []

    return projects.filter((project) => {
      // Check if project has active reward streams
      // A project has active streams if it has a kycTeam with rewardStreams that have active rounds
      if (!project.kycTeam?.rewardStreams?.length) return true

      return !project.kycTeam.rewardStreams.some((stream) => stream.round)
    })
  }, [projects])

  const { mutate: createProjectKYCTeams, isPending: createIsPending } =
    useMutation({
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

  const { mutate: deleteProjectKYCTeams, isPending: deleteIsPending } =
    useMutation({
      mutationKey: ["deleteProjectKYCTeams"],
      mutationFn: async (projectIds: string[]) => {
        if (!kycTeamId || projectIds.length === 0) return
        await deleteProjectKYCTeamsAction({ projectIds, kycTeamId })
        await queryClient.invalidateQueries({
          queryKey: ["kycTeamProjects", kycTeamId],
        })
        toast.success("Projects removed successfully")
        onOpenChange(false)
      },
    })

  const [selectedProjectIds, setSelectedProjectIds] = React.useState<string[]>(
    alreadySelectedProjectIds ?? [],
  )

  const onSubmit = () => {
    // Project KYC Teams to remove = already selected - selected
    const projectsToRemove = alreadySelectedProjectIds?.filter(
      (projectId) => !selectedProjectIds?.includes(projectId),
    )
    // Project KYC Teams to add = selected - already selected
    const projectsToAdd = selectedProjectIds?.filter(
      (projectId) => !alreadySelectedProjectIds?.includes(projectId),
    )
    if (projectsToRemove?.length) {
      deleteProjectKYCTeams(projectsToRemove)
    }
    if (projectsToAdd?.length) {
      createProjectKYCTeams(projectsToAdd)
    }
  }

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
        {availableProjects?.length !== 0 && (
          <DialogTitle className="text-center leading-7 font-semibold text-xl">
            Choose the projects that will use this grant delivery address
          </DialogTitle>
        )}
        {availableProjects?.length === 0 ? (
          <span className="text-sm text-secondary-foreground">
            {projects?.length === 0
              ? "No available projects"
              : "No projects available for KYC team assignment (all have active reward streams)"}
          </span>
        ) : (
          <>
            <ul className="space-y-2 w-full">
              {availableProjects?.map((project, i) => (
                <li
                  key={`${project.id} - ${i}`}
                  className="input-container space-x-2 text-sm text"
                >
                  <Checkbox
                    className="w-5 h-5"
                    defaultChecked={selectedProjectIds?.includes(project.id)}
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
                disabled={createIsPending || deleteIsPending}
                onClick={onSubmit}
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
