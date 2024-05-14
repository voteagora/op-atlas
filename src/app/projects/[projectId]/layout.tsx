import { Suspense } from "react"

import { ProjectSidebar } from "@/components/projects/ProjectSidebar"

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { projectId: string }
}>) {
  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <Suspense
          fallback={<div className="hidden sm:flex flex-col w-[228px]" />}
        >
          <ProjectSidebar projectId={params.projectId} />
        </Suspense>
        <div className="card flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
