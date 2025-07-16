import { GetHelpFooter } from "./GetHelpFooter"
import { GrantsCarousel } from "./GrantsCarousel"
import { GrantsGlossary } from "./GrantsGlossary"
import { HomeHeader } from "./HomeHeader"
import { RewardedProjectCrousel } from "./RewardedProjectCrousel"
import { Sunny } from "./Sunny"

export const Home = () => {
  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-8 bg-background flex flex-col p-8 md:p-16 w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col w-full gap-16">
          <HomeHeader />

          <GrantsCarousel />

          <RewardedProjectCrousel />

          <Sunny />
          
          <GrantsGlossary />

          <GetHelpFooter />
        </div>
      </div>
    </main>
  )
}
