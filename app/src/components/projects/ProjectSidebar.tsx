import {
  getConsolidatedProjectTeamWithClient,
  getProjectContractsWithClient,
  getProjectWithClient,
} from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { withSessionDb } from "@/lib/db/sessionContext"
import { formatRecurringRewards } from "@/lib/utils/rewards"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  return withSessionDb(async ({ db }) => {
    const [project, team, contracts, recurringRewards] = await Promise.all([
      getProjectWithClient({ id: projectId }, db),
      getConsolidatedProjectTeamWithClient({ projectId }, db),
      getProjectContractsWithClient({ projectId }, db),
      getProjectRecurringRewards(projectId, db),
    ])

    return (
      <ProjectStatusSidebar
        project={project}
        team={team}
        contracts={contracts}
        recurringRewards={formatRecurringRewards(recurringRewards)}
      />
    )
  })
}
