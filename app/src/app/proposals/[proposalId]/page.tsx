import { notFound } from "next/navigation"
import styles from "@/app/proposals/proposalPage.module.scss"
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
      <div className="flex justify-between mt-12">
        <div className="flex flex-col">
          <div className="flex gap-8 lg:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
            <div className={styles.proposal_description_md}>
              <Markdown
                content={stripTitleFromDescription("# Title", "Description")}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page
