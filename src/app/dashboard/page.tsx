import React from "react"
import ProfileDetailCard from "@/components/dashboard/ProfileDetailCard"
import ApplyRetroFundingRoundInfoBanner from "@/components/dashboard/ApplyRetroFundingRoundInfoBanner"
import UserProjectsDetailsSection from "@/components/dashboard/UserProjectsDetailsSection"
import { Button } from "@/components/ui/button"

const Page = () => {
  return (
    <div className="h-full bg-gradient-secondary flex items-center justify-center py-10">
      <div className="card w-3/4 mx-auto p-16 flex flex-col gap-12">
        <ProfileDetailCard />
        <ApplyRetroFundingRoundInfoBanner />
        <UserProjectsDetailsSection />
        <div className="flex items-center gap-x-2">
          <Button variant="secondary">Add</Button>
          <Button variant="secondary">Join</Button>
        </div>
      </div>
    </div>
  )
}

export default Page
