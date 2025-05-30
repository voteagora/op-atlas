import Proposals from "@/app/proposals/proposalsPage/components/standardProposals/Proposals"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"

const MOCKDATA = {
  proposals: [
    {
      badge: {
        text: "Soon",
        badgeType: ProposalBadgeType.callout,
      },
      textContent: {
        title: "Developer Advisory Board: Audit Request Team",
        subtitle: "Voters, Citizens, Delegates",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/1",
      },
    },
    {
      badge: {
        text: "Soon",
        badgeType: ProposalBadgeType.callout,
      },
      textContent: {
        title: "Developer Advisory Board: Governance Missions Team",
        subtitle: "Voters, Citizens, Delegates",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/2",
      },
    },
    {
      badge: {
        text: "Soon",
        badgeType: ProposalBadgeType.callout,
      },
      textContent: {
        title: "Developer Advisory Board: Foundation Missions Team",
        subtitle: "Voters, Citizens, Delegates",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/3",
      },
    },
  ],
}

const Page = () => {
  // Get the proposals page

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12 bg-[#FBFCFE] gap-[46px] mt-10">
      <h1 className="w-[66.5rem] h-[44px] text-[36px] font-semibold leading-[0px] tracking-[0%]">
        Governance
      </h1>
      <Proposals proposals={MOCKDATA.proposals} heading="Proposals" />
    </main>
  )
}

export default Page
