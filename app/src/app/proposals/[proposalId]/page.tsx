import { notFound } from "next/navigation"
import Breadcrumbs from "@/app/proposals/components/Breadcrumbs"
import ProposalTitle from "@/app/proposals/components/ProposalTitle"
import ProposalStatus from "@/app/proposals/components/ProposalStatus"
import ProposalDescription from "@/app/proposals/components/ProposalDescription"
import VotingSidebar from "@/app/proposals/components/VotingSidebar"

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

  const mock = {
    breadcrumbs: "Audit Request Team",
    title: "Developer Advisory Board: Audit Request Team",
    status: "Nominations [Start Date] - [End Date]",
    description:
      "# Developer Advisory Board: Audit Request Team\n\nDescription",
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <div className="flex justify-between mt-12">
        <Breadcrumbs value={mock.breadcrumbs} />
        <div className="flex flex-col"></div>
        <ProposalTitle title={mock.title} />
        <ProposalStatus status={mock.status} />
        <ProposalDescription description={mock.description} />
      </div>
      <VotingSidebar />
    </main>
  )
}


export default Page
