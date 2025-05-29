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
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-20 md:pb-40 pt-10 md:pt-20">
      <div className="w-full max-w-[1064px] min-h-[865px] px-4 md:px-0 flex flex-col md:flex-row justify-between">
        <div className="w-full md:w-[712px] flex flex-col space-y-4 mb-8 md:mb-0">
          <Breadcrumbs value={mock.breadcrumbs} />
          <ProposalTitle title={mock.title} className="mt-2" />
          <ProposalStatus status={mock.status} className="mt-2" />
          <ProposalDescription description={mock.description} className="mt-4" />
        </div>
        <div className="w-full md:w-[304px] md:ml-12">
          <VotingSidebar className="sticky top-4" />
        </div>
      </div>
    </main>
  )
}


export default Page
