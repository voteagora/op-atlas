"use client"

import { User } from "@prisma/client"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProfileDetailCard from "./ProfileDetailCard"
import AddFirstProjectSection from "./AddFirstProjectSection"
import ApplyRetroFundingRoundInfoBanner from "./ApplyRetroFundingRoundInfoBanner"

const Dashboard = ({ className, user }: { className?: string; user: User }) => {
  return (
    <div className={cn("card flex flex-col w-full gap-y-12", className)}>
      <ProfileDetailCard user={user} />

      <div className="flex flex-col gap-6">
        <h3>Your Projects</h3>
        <Link href="/projects/new">
          <AddFirstProjectSection />
        </Link>

        <div className="flex items-center gap-x-2">
          <Link href="/projects/new">
            <Button variant="destructive">Add a project</Button>
          </Link>
          <Button variant="secondary">Join a project</Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-6">
        <h3>Your Retro Funding applications</h3>
        <ApplyRetroFundingRoundInfoBanner />

        <Link
          href="#"
          className="flex items-center gap-x-2 no-underline text-secondary-foreground"
        >
          <p className="text-sm font-medium">
            Learn more about Retro Funding Round 4
          </p>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
