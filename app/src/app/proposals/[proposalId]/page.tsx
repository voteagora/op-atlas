import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { getProjectMetrics } from "@/lib/oso"
import Markdown from "@/components/common/Markdown/Markdown"

function stripTitleFromDescription(title: string, description: string) {
  if (description.startsWith(`# ${title}`)) {
    const newDescription = description.slice(`# ${title}`.length).trim()
    return newDescription
  }
  return description
}

interface PageProps {
  params: {
    proposalId: string
  }
}

const Page = (params: PageProps) => {
  // Get the proposals page

  const { proposalId } = params.params

  const proposalIdData = true

  if (!proposalIdData) {
    return notFound()
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <Markdown content={stripTitleFromDescription("", "")} />
    </main>
  )
}

export default Page
