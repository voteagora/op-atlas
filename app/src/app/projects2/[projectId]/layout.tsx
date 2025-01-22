import { Suspense } from "react"

import { FeedbackButton } from "@/components/common/FeedbackButton"
import { ProjectSidebar } from "@/components/projects/ProjectSidebar"

import UnsavedChangesToastServer from "./components/UnsavedChangesToast.Server"

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
        <div className="fixed bottom-4 left-4">
          <FeedbackButton />
        </div>
        <Suspense
          fallback={<div className="hidden sm:flex flex-col w-[228px]" />}
        >
          <ProjectSidebar projectId={params.projectId} />
        </Suspense>
        <div className="card flex-1">
          <UnsavedChangesToastServer projectId={params.projectId} />
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
