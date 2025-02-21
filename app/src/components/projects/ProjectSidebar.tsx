import { getProject, getProjectContracts } from "@/db/projects"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  const [project, contracts] = await Promise.all([
    getProject({ id: projectId }),
    getProjectContracts({ projectId }),
  ])

  return <ProjectStatusSidebar project={project} contracts={contracts} />
}
