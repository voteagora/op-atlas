import { CheckCircle2, EyeOff, Info, Triangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/common/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function RewardsTable() {
  return (
    <div className="space-y-6">
      <div className="relative w-full rounded-xl border border-red-300 flex items-center justify-center space-y-6 h-64 flex-col mt-4 overflow-hidden bg-red-100">
        <div className="text-center space-y-3 z-50">
          <span className="font-extrabold text-4xl">1,264 OP</span>
          <p className="text-secondary-foreground">
            Rewards so far in Retro Funding: Onchain Builders
          </p>
        </div>
        <Button variant="primary" className="z-50">
          Claim your rewards
        </Button>
      </div>
      <Tabs defaultValue={REWARDS.at(0)?.key} className="w-full mt-12">
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto h-fit">
          {/* TODO: Replace MONTHS with actual data */}
          {MONTHS.map((month, index) => (
            <TabsTrigger
              key={index}
              value={month}
              className="rounded-lg py-2 px-4 bg-secondary text-secondary-foreground border border-tertiary min-w-36 w-full data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
        {REWARDS.map(({ key, achievements, totalRewards }) => (
          <TabsContent
            key={key}
            value={key}
            className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
          >
            {achievements.map(({ value, title, trend }, index) => (
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
            <div className="rounded-lg p-6 flex items-center justify-between w-full bg-background border col-span-2 divide-x-2">
              <div className="space-x-2 flex h-12">
                <Image
                  src="/assets/chain-logos/optimism-letters.svg"
                  width={40}
                  height={40}
                  alt="Optimism Logo"
                />
                <div className="flex flex-col h-full justify-between py-0.5">
                  <span className="font-semibold text-foreground">
                    1,264 OP
                  </span>
                  <span className="text-secondary-foreground">
                    Rewards for performance in February
                  </span>
                </div>
              </div>
              <p className="w-1/2 pl-6 text-secondary-foreground text-sm">
                Rewards are determined by an{" "}
                <span className="font-semibold">evaluation algorithm</span>{" "}
                powered by onchain data, and some metrics are more valuable than
                others.{" "}
                <Link href={"#"} className="underline">
                  Learn more
                </Link>
              </p>
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
  achievements: [
    {
      value: getRandomValue(),
      title: "TVL across the Superchain",
      trend: getRandomTrend(),
    },
    {
      value: getRandomValue(),
      title: "Transactions",
      trend: getRandomTrend(),
    },
    {
      value: getRandomValue(),
      title: "Gas consumed",
      trend: getRandomTrend(),
    },
    {
      value: getRandomValue(),
      title: "Qualified addresses",
      trend: getRandomTrend(),
    },
  ],
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
