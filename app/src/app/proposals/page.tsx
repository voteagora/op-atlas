import Proposals from "@/app/proposals/proposalsPage/components/Proposals"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"
import { getUsersCitizens } from "@/db/citizens"

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

const getProposalData = async () => {
  const proposalResponse = await fetch(
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `http://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/proposals`
      : `/api/proposals`,
  )

  return proposalResponse.json()
}

const enrichProposalData = (proposals: any, citizensData: any) => {
  console.log(proposals)
  console.log(citizensData)
}

const getEnrichedProposalData = async () => {
  try {
    // Get the proposal data from the API
    const proposalData = await getProposalData()
    try {
      // Get the citizen data from DB
      const citizensData = await getUsersCitizens()
      // Enrich the proposal data with citizen data for conditional vote status rendering
      return enrichProposalData(proposalData, citizensData)
    } catch (error) {
      console.error("Failed to fetch Citizen Data")
    }
    // If we can't get citizen data, just return the proposal data
    return proposalData.standardProposals
  } catch (error) {
    console.error("Failed to fetch Proposal Data")
  }
}

const Page = async () => {
  // Get the proposals page

  const standardProposals: any[] = await getEnrichedProposalData()
  const selfNominations: any = [] // TODO

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
