import { getProject } from "@/db/projects"

import UnsavedChangesToastClient from "./UnsavedChangesToast.Client"

const UnsavedChangesToastServer = async ({
  projectId,
}: {
  projectId: string
}) => {
  const project = await getProject({ id: projectId })
  if (!project) return null

  return <UnsavedChangesToastClient project={project} />
}

export default UnsavedChangesToastServer
