import ProjectFormStatusSidebar from "@/components/projects/ProjectFormStatusSidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="h-full bg-secondary flex">
      <div className="flex items-start w-3/4 mx-auto my-16 gap-x-12">
        <ProjectFormStatusSidebar />
        <div className="card flex-1">{children}</div>
      </div>
    </div>
  )
}
