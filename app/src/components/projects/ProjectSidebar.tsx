import { getProject } from "@/db/projects"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  const project = (await getProject({ id: projectId })) ?? undefined

  return <ProjectStatusSidebar project={project} />
}
