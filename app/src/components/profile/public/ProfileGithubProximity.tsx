import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import useGithubProximity from "@/hooks/useGithubProximity"
import { UserWithAddresses } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

const labels = [
  {
    threshold: 1,
    emoji: "🌟",
    text: "Highest",
  },
  {
    threshold: 0.95,
    emoji: "🎉",
    text: "Very High",
  },
  {
    threshold: 0.9,
    emoji: "👏",
    text: "High",
  },
] as const

function ProfileGithubProximity({ user }: { user: UserWithAddresses }) {
  const { data, isLoading, error } = useGithubProximity(user.github)
  const [isContentVisible, setIsContentVisible] = useState(false)

  if (isLoading) return null
  if (error) return null
  if (!data) return null

  const label = labels.find((l) => data.percentile >= l.threshold)

  if (data.percentile < 0.8) return null

  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium flex items-center gap-x-2">
        OP Stack Proximity
        <span className="text-xs text-secondary-foreground bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
          Experimental
        </span>
      </h2>

      <div className="grid grid-cols-5 gap-x-8 bg-white rounded-lg border border-gray-200 p-8">
        <div className="col-span-3 mt-4 font-semibold">
          <div>
            {user.name} ranks in the top{" "}
            {Math.round((1 - data.percentile) * 100)}% of developers on Github
            for proximity to the OP Stack
          </div>
          <div className="mt-2">
            <OutboundArrowLink
              text={`@${user.github}`}
              target={`https://github.com/${user.github}`}
              className="text-sm text-gray-500"
            />
          </div>
        </div>

        <div className="col-span-2 flex items-start">
          <div className="relative w-48 h-32">
            <svg className="w-[192px] h-[128px]">
              <defs>
                <linearGradient
                  id="redGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" style={{ stopColor: "#fee2e2" }} />
                  <stop offset="100%" style={{ stopColor: "#ef4444" }} />
                </linearGradient>
              </defs>
              <path
                d="M 12 96 A 84 84 0 0 1 180 96"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <path
                d="M 12 96 A 84 84 0 0 1 180 96"
                stroke="url(#redGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${Math.PI * 84}`}
                strokeDashoffset={`${Math.PI * 84 * (1 - data.percentile)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-5">
              <span className="text-4xl font-extrabold">
                {Math.round(data.percentile * 100)}
                <span className="text-lg font-normal">th</span>
              </span>
              <span className="text-sm text-gray-500">PERCENTILE</span>
            </div>
          </div>
          {label && (
            <Badge
              variant="destructive"
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white gap-x-1"
            >
              <span className="text-white">{label.emoji}</span>{" "}
              <span className="text-white font-normal whitespace-nowrap">
                {label.text}
              </span>
            </Badge>
          )}
        </div>

        <div className="col-span-3 ">
          <div className="flex flex-col">
            <div
              className={`content mt-4 text-sm text-gray-600 space-y-4 ${
                !isContentVisible ? "hidden" : ""
              }`}
            >
              <p className="text-sm">
                This experimental ranking evaluates GitHub developers and repos
                based on their proximity to OP Stack repos. Using GitHub event
                data and bipartite trust graph, it applies variations of
                EigenTrust and Hubs & Authorities algorythms. Trust is built
                from user actions (e.g. stars, forks) and contributions (e.g.
                PRs merged). The ranking is logarythmic, and scores in the 90th
                percentile are considered high.
              </p>
              <p className="text-sm">
                The ranking was developed in collaboration with{" "}
                <a
                  href="https://openrank.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 underline hover:text-gray-700"
                >
                  OpenRank
                </a>{" "}
                and{" "}
                <a
                  href="https://opensourceobserver.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 underline hover:text-gray-700"
                >
                  OpenSourceObserver
                </a>
                . Want to go deeper?{" "}
                <a
                  href="https://gov.optimism.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 underline hover:text-gray-700"
                >
                  Learn more in our forum post
                </a>
                .
              </p>
            </div>
            <div className="flex items-center gap-x-4 mt-6">
              <button
                onClick={() => setIsContentVisible(!isContentVisible)}
                className="text-left text-sm text-gray-500 hover:text-gray-700 cursor-pointer mt-1"
              >
                <div className="flex items-center gap-x-1">
                  About the ranking{" "}
                  {isContentVisible ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </div>
              </button>
              <OutboundArrowLink
                text="OpenRank docs"
                target="https://docs.openrank.com/integrations/github-developers-and-repo-ranking"
                className={`text-sm text-gray-500 hover:text-gray-700 link ${
                  isContentVisible ? "" : "hidden"
                } mt-2`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileGithubProximity
