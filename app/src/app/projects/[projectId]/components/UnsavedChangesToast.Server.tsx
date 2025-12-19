import { getProjectWithClient } from "@/db/projects"
import { withImpersonation } from "@/lib/db/sessionContext"

import UnsavedChangesToastClient from "./UnsavedChangesToast.Client"

const UnsavedChangesToastServer = async ({
  projectId,
}: {
  projectId: string
}) =>
  withImpersonation(async ({ db }) => {
    const project = await getProjectWithClient({ id: projectId }, db)
    if (!project) return null

    return <UnsavedChangesToastClient project={project} />
  })

export default UnsavedChangesToastServer
