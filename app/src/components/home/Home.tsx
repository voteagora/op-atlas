import { getWeightedRandomGrantRecipients } from "@/db/projects"

import { GrantsInfo } from "./GrantsInfo"
import { HomeFooter } from "./HomeFooter"
import { HomeHeader } from "./HomeHeader"
import { OtherSuperchainGrants } from "./OtherSuperchainGrants"
import { RewardedProjectCrousel } from "./RewardedProjectCrousel"
import { SunnyGuide } from "./SunnyGuide"
import { UserProjectsCTA } from "./UserProjectsCTA"

export const Home = async () => {
  const projects = await getWeightedRandomGrantRecipients()

  return (
    <main className="flex flex-col flex-1 h-full items-center relative pt-12 md:pt-[100px] gap-12 md:gap-20">
      <div className="bg-background flex flex-col max-w-[1064px] w-full px-6 md:px-0">
        <div className="flex flex-col w-full gap-12 md:gap-20">
          <HomeHeader />
          <GrantsInfo />
          <SunnyGuide />
          <RewardedProjectCrousel projects={projects} />
          <OtherSuperchainGrants />
          <UserProjectsCTA />
        </div>
      </div>
      <HomeFooter />
    </main>
  )
}
