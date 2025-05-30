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
        badgeType: ProposalBadgeType.now,
      },
      voted: true,
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
        badgeType: ProposalBadgeType.now,
      },
      voted: false,
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
    {
      badge: {
        badgeType: ProposalBadgeType.past,
      },
      passed: false,
      textContent: {
        title: "Lore ipsum Doler: Amet",
        subtitle: "Voters, Citizens, Delegates",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/5",
      },
    },
    {
      badge: {
        badgeType: ProposalBadgeType.past,
      },
      passed: true,
      textContent: {
        title: "Lore ipsum Doler: Amet",
        subtitle: "Voters, Citizens, Delegates",
      },
      dates: {
        startDate: "05-30-2025",
        endDate: "06-07-2025",
      },
      arrow: {
        href: "/proposals/6",
      },
    },
  ],
  selfNominations: [
    // {
    //   badge: {
    //     badgeType: ProposalBadgeType.now,
    //   },
    //   voted: false,
    //   textContent: {
    //     title: "Developer Advisory Board: Audit Request Team",
    //   },
    //   dates: {
    //     startDate: "05-30-2025",
    //     endDate: "06-07-2025",
    //   },
    //   arrow: {
    //     href: "/proposals/5",
    //   },
    // },
    // {
    //   badge: {
    //     badgeType: ProposalBadgeType.now,
    //   },
    //   voted: true,
    //   textContent: {
    //     title: "Developer Advisory Board: Audit Request Team",
    //   },
    //   dates: {
    //     startDate: "05-30-2025",
    //     endDate: "06-07-2025",
    //   },
    //   arrow: {
    //     href: "/proposals/8",
    //   },
    // },
  ],
}

const getMockProposalData = () => {
  return MOCKDATA
}

const Page = () => {
  // Get the proposals page

  const proposals = getMockProposalData()
  const standardProposals = proposals.standardProposals
  const selfNominations = proposals.selfNominations

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-40 gap-[46px] mt-10 max-w-[1064px] mx-auto">
      <div className="flex flex-col gap-12">
        <h1 className="w-full h-[44px] text-[36px] font-semibold leading-[0px] tracking-[0%]">
          Governance
        </h1>
        {selfNominations.length > 0 && (
          <Proposals
            proposals={selfNominations}
            heading="Self Nominate for a governance role in Season 8 & 9"
            subheading="Calling all canidates! Submit your nominations from [date] - [date]"
          />
        )}
        <Proposals proposals={standardProposals} heading="Proposals" />
      </div>
    </main>
  )
}

export default Page
