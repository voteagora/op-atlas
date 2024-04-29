import ProjectFormStatusSidebar from "@/components/projects/ProjectSidebar"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"

export default function Page() {
  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectFormStatusSidebar />
        <div className="card flex-1">
          <ProjectDetailsForm />
        </div>
      </div>
    </div>
  )
}
