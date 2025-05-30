import Proposals from "@/app/proposals/proposalsPage/components/Proposals"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"

const MOCKDATA = {
  standardProposals: [
    {
      badge: {
        badgeType: ProposalBadgeType.soon,
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
        badgeType: ProposalBadgeType.soon,
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
        badgeType: ProposalBadgeType.soon,
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
  selfNominations: [
    {
      badge: {
        badgeType: ProposalBadgeType.now,
      },
      textContent: {
        title: "Developer Advisory Board: Audit Request Team",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/5",
      },
    },
  ],
}

const Page = () => {
  // Get the proposals page

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 gap-[46px] mt-10">
      <h1 className="w-[66.5rem] h-[44px] text-[36px] font-semibold leading-[0px] tracking-[0%]">
        Governance
      </h1>
      <Proposals
        proposals={MOCKDATA.selfNominations}
        heading="Self Nominate for a governance role in Season 8 & 9"
        subheading="Calling all canidates! Submit your nominations from [date] - [date]"
      />
      <Proposals proposals={MOCKDATA.standardProposals} heading="Proposals" />
    </main>
  )
}

export default Page
