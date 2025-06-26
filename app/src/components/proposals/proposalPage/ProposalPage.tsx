import Breadcrumbs from "@/components/proposals/proposalPage/proposalContent/Breadcrumbs"
import Markdown from "@/components/proposals/proposalPage/proposalContent/Markdown"
import ProposalHeader from "@/components/proposals/proposalPage/proposalContent/ProposalHeader"
import VotingSidebar from "@/components/proposals/proposalPage/VotingSidebar/VotingSidebar"
import { ProposalData } from "@/lib/proposals"

function stripTitleFromDescription(title: string, description: string) {
  if (description.startsWith(`# ${title}`)) {
    return description.slice(`# ${title}`.length).trim()
  }
  // If title not found return the description as is
  return description
}

const ProposalPage = async ({
  proposalData,
}: {
  proposalData: ProposalData
}) => {
  const deTitledProposalDescription = stripTitleFromDescription(
    proposalData.markdowntitle,
    proposalData.description,
  )

  // Format dates for display (MM-DD-YYYY) - same format as ProposalCard
  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  }

  const formattedStartDate = formatDate(new Date(proposalData.startTime))
  const formattedEndDate = formatDate(new Date(proposalData.endTime))

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Governance", href: "/governance" },
    { label: "Proposal", href: `/proposals/${proposalData.id}` },
  ]

  return (
    <main className="flex w-full min-h-screen pb-[160px] mx-auto">
      <div className="proposal flex flex-col w-full max-w-[1064px] mt-16 md:mt-24 gap-8 md:gap-[48px] mx-auto px-4 md:px-6">
        <div className="column-container gap-6 md:gap-[48px] flex justify-between items-start flex-col md:flex-row">
          <div className="proposal-content w-full lg:min-w-[712px] lg:max-w-[712px] flex flex-col gap-6 md:gap-[44px] mb-8 md:mb-0 min-w-0">
            <Breadcrumbs values={breadcrumbs} />
            <ProposalHeader
              title={proposalData.markdowntitle}
              status={proposalData.status}
              startDate={formattedStartDate}
              endDate={formattedEndDate}
            />
            <Markdown description={deTitledProposalDescription} />
          </div>
          <div className="voting-sidebar w-full md:w-[304px] md:flex-shrink-0 flex justify-center md:justify-start">
            <VotingSidebar proposalData={proposalData} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProposalPage
