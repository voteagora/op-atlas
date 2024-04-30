import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ProjectFormStatusSidebar from "@/components/projects/ProjectSidebar"
import { getProject } from "@/db/projects"
import { getUserByFarcasterId } from "@/db/users"

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { projectId: string }
}>) {
  const session = await auth()
  if (!session?.user.id) {
    redirect("/")
  }

  const [user, project] = await Promise.all([
    getUserByFarcasterId(session.user.farcasterId),
    getProject({ id: params.projectId }),
  ])

  if (!user || !project) {
    redirect("/dashboard")
  }

  // Validate that the current user is part of the project
  if (!project.team.some((member) => member.userId === user.id)) {
    redirect("/dashboard")
  }

  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectFormStatusSidebar project={project} />
        <div className="card flex-1">{children}</div>
      </div>
    </div>
  )
}
