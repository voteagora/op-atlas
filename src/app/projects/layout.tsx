import ProjectFormStatusSidebar from "@/components/projects/ProjectFormStatusSidebar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="h-full bg-secondary flex flex-1">
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectFormStatusSidebar />
        <div className="card flex-1">{children}</div>
      </div>
    </div>
  )
}
