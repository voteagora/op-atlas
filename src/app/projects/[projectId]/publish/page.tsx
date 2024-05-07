import { redirect } from "next/navigation"

import { PublishForm } from "@/components/projects/publish/PublishForm"
import { getProject } from "@/db/projects"

// TODO: Increase API timeout since attestation creation is slow

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const project = await getProject({ id: params.projectId })

  if (!project) {
    redirect("/dashboard")
  }

  return <PublishForm project={project} />
}
