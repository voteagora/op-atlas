"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "@/components/common/UserAvatar"

type SimplifiedUserOrOrg = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

export const CandidateResult = ({
  candidate,
  value,
}: {
  candidate: SimplifiedUserOrOrg
  value: number
}) => {
  return (
    <div className="w-full h-10 p-2 text-sm text-secondary-foreground ">
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <UserAvatar imageUrl={candidate?.avatar} size={"xs"} />

          <div className="w-[100px] whitespace-nowrap overflow-hidden text-ellipsis hover:underline cursor-pointer">
            <Link
              href={candidate.link}
              target="_blank"
              rel="noopener noreferrer"
              title={candidate.name}
            >
              {candidate.name}
            </Link>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <div className="w-[72px] h-6 px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-success text-success-foreground text-xs font-semibold">
            Elected
          </div>
          <ChevronRight
            width={12}
            height={12}
            className="text-secondary-foreground"
          />
        </div>

        {/* <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 min-w-[2rem] text-right">
            {value.toFixed(2)}%
          </div>
        </div> */}
      </div>
    </div>
  )
}
