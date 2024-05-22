import { FeedbackButton } from "@/components/common/FeedbackButton"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { ProjectStatusSidebar } from "@/components/projects/ProjectStatusSidebar"

export const maxDuration = 60

export default function Page() {
  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectStatusSidebar />
        <div className="card flex-1">
          <ProjectDetailsForm />
        </div>
      </div>
    </div>
  )
}
