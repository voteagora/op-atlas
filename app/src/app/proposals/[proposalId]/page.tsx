import { notFound } from "next/navigation"
import styles from "@/app/proposals/proposalPage.module.scss"
import Markdown from "@/components/common/Markdown/Markdown"
import { describe } from "node:test"

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

const Breadcrumbs = ({ value }: { value: string }) => (
  <div className="flex gap-4">{value}</div>
)
const ProposalTitle = ({ title }: { title: string }) => (
  <div className="text-h2">{title}</div>
)
const ProposalStatus = ({ status }: { status: string }) => (
  <div className="text-h2">{status}</div>
)
const ProposalDescription = ({ description }: { description: string }) => (
  <div className="flex gap-8 lg:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
    <div className={styles.proposal_description_md}>
      <Markdown content={stripTitleFromDescription("# Title", "Description")} />
    </div>
  </div>
)
const VotingSidebar = () => <div className="flex flex-col gap-4"></div>

export default Page
