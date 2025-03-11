import { CheckCircle2, EyeOff, Info, Triangle } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function RewardsTable() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue={REWARDS.at(0)?.key} className="w-full mt-12">
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto">
          {/* TODO: Replace MONTHS with actual data */}
          {MONTHS.map((month, index) => (
            <TabsTrigger
              key={index}
              value={month}
              className="rounded-lg py-2 px-4 bg-background border border-tertiary min-w-36 w-full data-[state=active]:bg-contrast data-[state=active]:text-contrast-white"
            >
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
        {REWARDS.map(({ key, rewards, totalRewards }) => (
          <TabsContent
            key={key}
            value={key}
            className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
          >
            {rewards.map(({ value, title, trend }, index) => (
              <div
                key={index}
                className="flex flex-col justify-between p-6 bg-background rounded-lg border"
              >
                <div className="w-full flex items-center justify-between space-x-1">
                  <span className="font-semibold">{value}</span>
                  <span
                    className={cn([
                      "px-2.5 py-1 rounded-full text-xs font-medium flex space-x-1 items-center",
                      {
                        "bg-green-100 text-green-foreground":
                          trend.type === "increase",
                        "bg-red-100 text-red-foreground":
                          trend.type === "decrease",
                      },
                    ])}
                  >
                    <span>{trend.value}</span>
                    {trend.type === "increase" ? (
                      <Triangle
                        size={12}
                        className="text-success-foreground"
                        fill="#006117"
                      />
                    ) : (
                      <Triangle
                        size={12}
                        className="rotate-180 text-red-600"
                        fill="#B80018"
                      />
                    )}
                  </span>
                </div>
                <div>{title}</div>
              </div>
            ))}
            <div className="rounded-lg p-6 flex flex-col items-center justify-center w-full bg-background border col-span-2">
              <span className="font-semibold">{totalRewards}</span>
              <span className="text-secondary-foreground">
                Rewards in {key}
              </span>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <ul>
        {/* TODO: Replace this with actual data */}
        {NOTIFICATIONS.map(({ type, message }, index) => (
          <li key={index} className="flex items-center space-x-1 group">
            {type === "success" && (
              <CheckCircle2 size={16} fill="#404454" className="text-white" />
            )}
            {type === "info" && (
              <Info size={16} fill="#404454" className="text-white" />
            )}
            <span>{message}</span>
            <button>
              <EyeOff
                size={16}
                className="group-hover:opacity-100 transition-all duration-300 opacity-0"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// NOTE: Mock data
const MONTHS = ["February", "March", "April", "May", "June", "July"]

const getRandomValue = () => `$${(Math.random() * 10000 + 1000).toFixed(2)}`
const getRandomTrend = () => {
  const value = (Math.random() * 10).toFixed(1)
  const type = Math.random() > 0.5 ? "increase" : "decrease"
  return { value: `${value}%`, type }
}
const getRandomTotalRewards = () => Math.floor(Math.random() * 10000)

const REWARDS = MONTHS.map((month) => ({
  key: month,
  rewards: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
    value: getRandomValue(),
    title: "TVL across the Superchain",
    trend: getRandomTrend(),
  })),
  totalRewards: `${getRandomTotalRewards()} OP`,
}))

const NOTIFICATIONS = [
  {
    type: "success",
    message:
      "Your Account Abstraction contracts were found in BundleBear—you’re receiving extra OP.",
  },
  {
    type: "info",
    message:
      "Rewards are determined by an evaluation algorithm powered by onchain data",
  },
]
//
