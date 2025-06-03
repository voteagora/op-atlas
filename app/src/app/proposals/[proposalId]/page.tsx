import { notFound } from "next/navigation"
import Breadcrumbs from "@/app/proposals/components/Breadcrumbs"
import ProposalTitle from "@/app/proposals/components/ProposalTitle"
import ProposalStatus from "@/app/proposals/components/ProposalStatus"
import ProposalDescription from "@/app/proposals/components/ProposalDescription"
import VotingSidebar from "@/app/proposals/components/VotingSidebar/VotingSidebar"

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

  const MOCK = {
    breadcrumbs: "Audit Request Team",
    title: "Developer Advisory Board: Audit Request Team",
    status: "Nominations [Start Date] - [End Date]",
    description:
      "# Developer Advisory Board: Audit Request Team\n\nDescription",
    votingCardProps: {
      cardText: {
        title: "It's time to vote",
        description:
          "This election uses approval voting, meaning voter can approve more than one candidate.",
      },
      cardActions: {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Sign In",
            actionType: "Log",
          },
          {
            buttonStyle: "button-secondary",
            actionText: "Learn about approval voting",
            actionType: "Log",
          },
        ],
      },
    },
    votingColumnProps: {
      candidates: Array(8).fill({
        name: "Username",
        image: {
          src: "https://i.imgur.com/0000000.png",
          alt: "Image",
        },
        organizations: ["Org 1", "Org 2", "Org 3"],
        buttonLink: "https://google.com",
      }),
    },
  }

  return (
    <main className="flex w-full h-full pb-[160px] gap-[80px] mx-auto items-center border-red-600">
      <div className="flex flex-col w-2/3 mt-24 h-[865px] gap-[48px] mx-auto border-blue-600">
        <div className="flex flex-col gap-[44px]">
          <div className="flex justify-between items-start flex-col md:flex-row">
            <div className="w-full flex flex-col gap-[44px] mb-8 md:mb-0">
              <Breadcrumbs value={MOCK.breadcrumbs} />
              <ProposalTitle title={MOCK.title} />
              <ProposalStatus status={MOCK.status} />
              <ProposalDescription description={MOCK.description} />
            </div>
            <div className="w-full md:w-[304px] md:ml-12">
              <VotingSidebar
                className="sticky top-4"
                votingColumnProps={MOCK.votingColumnProps}
                votingCardProps={MOCK.votingCardProps}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page
