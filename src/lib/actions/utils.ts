import { getUserProjects } from "@/db/projects"

export const verifyMembership = async (
  projectId: string,
  farcasterId: string,
) => {
  const userProjects = await getUserProjects({ farcasterId })
  const membership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  if (!membership) {
    return {
      error: "Unauthorized",
    }
  }

  return null
}

export const verifyAdminStatus = async (
  projectId: string,
  farcasterId: string,
) => {
  const userProjects = await getUserProjects({ farcasterId })
  const membership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  if (membership?.role !== "owner" && membership?.role !== "admin") {
    return {
      error: "Unauthorized",
    }
  }

  return null
}
