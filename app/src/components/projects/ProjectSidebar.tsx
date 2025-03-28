import {
  getConsolidatedProjectTeam,
  getProject,
  getProjectContracts,
} from "@/db/projects"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  const [project, team, contracts] = await Promise.all([
    getProject({ id: projectId }),
    getConsolidatedProjectTeam({ projectId }),
    getProjectContracts({ projectId }),
  ])

  return (
    <ProjectStatusSidebar project={project} team={team} contracts={contracts} />
  )
}
