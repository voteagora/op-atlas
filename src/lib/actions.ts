"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createProject,
  CreateProjectParams,
  getUserProjects,
  updateProject,
} from "@/db/projects"

export const getProjects = async (farcasterId: string) => {
  const teams = await getUserProjects({ farcasterId })
  return (teams?.projects ?? []).map(({ project }) => project)
}

export const createNewProject = async (details: CreateProjectParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const project = await createProject({
    farcasterId: session.user.id,
    project: details,
  })

  revalidatePath("/dashboard")
  return {
    error: null,
    project,
  }
}

export const updateProjectDetails = async (
  projectId: string,
  details: CreateProjectParams,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const userProjects = await getUserProjects({ farcasterId: session.user.id })
  if (!userProjects?.projects.some(({ project }) => project.id === projectId)) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateProject({ id: projectId, project: details })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  return {
    error: null,
    project: updated,
  }
}
