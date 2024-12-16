import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import useGithubProximity from "@/hooks/useGithubProximity"
import { UserWithAddresses } from "@/lib/types"

function ProfileGithubProximity({ user }: { user: UserWithAddresses }) {
  const { data, isLoading, error } = useGithubProximity(user.github)

  if (isLoading) return null
  if (error) return null
  if (!data) return null
  if (data.percentile < 0.9) return null

  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium flex items-center gap-x-2">
        OP Stack Proximity
        <span className="text-xs text-secondary-foreground bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
          Experimental
        </span>
      </h2>

      <div className="grid grid-cols-3 gap-x-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="col-span-2 mt-4">
          <div>
            {user.github} ranks in the top{" "}
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

        <div className="col-span-1 relative w-48 h-32 ml-auto">
          <svg className="w-full h-full">
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
              d="M 24 96 A 72 72 0 0 1 168 96"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <path
              d="M 24 96 A 72 72 0 0 1 168 96"
              stroke="url(#redGradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${Math.PI * 72}`}
              strokeDashoffset={`${Math.PI * 72 * (1 - data.percentile)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
            <span className="text-2xl font-medium">
              {Math.round(data.percentile * 100)}th
            </span>
            <span className="text-sm text-gray-500">percentile</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileGithubProximity
