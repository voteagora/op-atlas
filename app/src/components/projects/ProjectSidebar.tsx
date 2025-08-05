import {
  getConsolidatedProjectTeam,
  getProject,
  getProjectContracts,
} from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { formatRecurringRewards } from "@/lib/utils/rewards"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  const [project, team, contracts, recurringRewards] = await Promise.all([
    getProject({ id: projectId }),
    getConsolidatedProjectTeam({ projectId }),
    getProjectContracts({ projectId }),
    getProjectRecurringRewards(projectId),
  ])

  return (
    <ProjectStatusSidebar
      project={project}
      team={team}
      contracts={contracts}
      recurringRewards={formatRecurringRewards(recurringRewards)}
    />
  )
}
