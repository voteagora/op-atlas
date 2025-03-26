"use client"

import { getMonth, parseISO } from "date-fns"
import { CheckCircle2, EyeOff, Info, Triangle } from "lucide-react"
import Image from "next/image"
import React from "react"

import { Button } from "@/components/common/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { INDEXED_MONTHS, MONTHS } from "./constants"

export type OnchainBuildersDataType = Record<string, number>
interface DataProps {
  activeAddresses: OnchainBuildersDataType
  gasFees: OnchainBuildersDataType
  transactions: OnchainBuildersDataType
  tvl: OnchainBuildersDataType
}

export function OnchainBuilderMission({ data }: { data?: DataProps }) {
  const groupedData = React.useMemo(() => {
    if (!data) return {}

    const grouped = {
      activeAddresses: groupByMonth(data.activeAddresses),
      gasFees: groupByMonth(data.gasFees),
      transactions: groupByMonth(data.transactions),
      tvl: groupByMonth(data.tvl),
    }

    const sum = (arr?: number[]) => arr?.reduce((acc, val) => acc + val, 0) || 0

    const getTrend = (
      current: number,
      previous: number,
    ): { value: number; sign: "inc" | "dec" | null } => {
      if (previous === 0) return { value: 0, sign: null }

      const diff = current - previous
      return {
        value: Math.abs(diff),
        sign: diff > 0 ? "inc" : diff < 0 ? "dec" : null,
      }
    }

    return MONTHS.reduce(
      (acc, month, index) => {
        const prevMonth = MONTHS[index - 1]

        const curr = {
          activeAddresses: sum(grouped.activeAddresses[month]),
          gasFees: sum(grouped.gasFees[month]),
          transactions: sum(grouped.transactions[month]),
          tvl: sum(grouped.tvl[month]),
        }

        const prev = {
          activeAddresses: sum(grouped.activeAddresses[prevMonth]),
          gasFees: sum(grouped.gasFees[prevMonth]),
          transactions: sum(grouped.transactions[prevMonth]),
          tvl: sum(grouped.tvl[prevMonth]),
        }

        acc[month] = {
          activeAddresses: {
            value: curr.activeAddresses,
            trend: getTrend(curr.activeAddresses, prev.activeAddresses),
          },
          gasFees: {
            value: curr.gasFees,
            trend: getTrend(curr.gasFees, prev.gasFees),
          },
          transactions: {
            value: curr.transactions,
            trend: getTrend(curr.transactions, prev.transactions),
          },
          tvl: {
            value: curr.tvl,
            trend: getTrend(curr.tvl, prev.tvl),
          },
        }

        return acc
      },
      {} as Record<
        string,
        {
          activeAddresses: {
            value: number
            trend: { value: number; sign: "inc" | "dec" | null }
          }
          gasFees: {
            value: number
            trend: { value: number; sign: "inc" | "dec" | null }
          }
          transactions: {
            value: number
            trend: { value: number; sign: "inc" | "dec" | null }
          }
          tvl: {
            value: number
            trend: { value: number; sign: "inc" | "dec" | null }
          }
        }
      >,
    )
  }, [data])

  function normalizeToTwoDecimals(num: number): number {
    if (num === 0) return 0

    const exponent = Math.floor(Math.log10(Math.abs(num)))
    const normalized = num / Math.pow(10, exponent)

    return Number(normalized.toFixed(2)) // returns 1.07
  }

  return (
    <div className="space-y-6">
      <div className="mt-6 relative w-full h-64 rounded-xl z-10 overflow-hidden">
        <div className="-top-[1024px] -left-[512px] rounded-full absolute w-[2048px] h-[2048px] bg-gradient-to-br from-[#FF744A78] from-50% to-[#FF5C6C] via-[#FF67B5] animate-slow-spin" />
        <Image
          className="absolute top-0 left-0 z-0 p-0.5 rounded-xl"
          src="/assets/images/rewards-on-chain-banner.png"
          objectFit="cover"
          objectPosition="center"
          layout="fill"
          alt="Rewards Banner"
        />
        <Image
          src="/assets/images/rewards-on-chain-element.png"
          width={256}
          height={256}
          alt="Dev Tooling"
          className="absolute bottom-0.5 right-0.5 rounded-br-[11px]"
        />
        <div className="absolute w-full h-full z-50">
          <div className="w-full h-full flex items-center justify-center flex-col space-y-6">
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
        </div>
      </div>
      <Tabs defaultValue={MONTHS[0]} className="w-full mt-12">
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto h-fit">
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
        {MONTHS.map((month) => {
          const data = groupedData[month]
          console.log(">>> data", data)
          return (
            <TabsContent
              key={month}
              value={month}
              className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              <MetricCard
                value={data.activeAddresses.value}
                title="TVL across the Superchain"
                trend={{
                  value: data.activeAddresses.trend.value.toString(),
                  type:
                    data.activeAddresses.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{ value: "$", position: "left" }}
                index={0}
              />
              <MetricCard
                value={data.transactions.value}
                title="Transactions"
                trend={{
                  value: data.transactions.trend.value.toString(),
                  type:
                    data.transactions.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{ value: "K", position: "right" }}
                index={1}
              />
              <MetricCard
                value={
                  data.gasFees.value &&
                  normalizeToTwoDecimals(data.gasFees.value)
                }
                title="Gas consumed"
                trend={{
                  value: normalizeToTwoDecimals(
                    data.gasFees.trend.value,
                  ).toString(),
                  type:
                    data.gasFees.trend.sign === "inc" ? "increase" : "decrease",
                }}
                sign={{ value: " ETH", position: "right" }}
                index={2}
              />
              <MetricCard
                value={data.tvl.value}
                title="Qualified addresses"
                trend={{
                  value: data.tvl.trend.value.toString(),
                  type: data.tvl.trend.sign === "inc" ? "increase" : "decrease",
                }}
                index={3}
              />
            </TabsContent>
          )
        })}
      </Tabs>
      <ul className="space-y-[8pt]">
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

function MetricCard({
  value,
  title,
  trend,
  index,
  sign = { value: "", position: "right" },
}: {
  value: string | number
  title: string
  trend: { value: string; type: "increase" | "decrease" }
  index: number
  sign?: {
    value: string
    position: "left" | "right"
  }
}) {
  const formattedValue = value
    ? `${sign.position === "left" ? sign.value : ""}${value}${
        sign.position === "right" ? sign.value : ""
      }`
    : "- -"
  return (
    <div
      key={index}
      className="flex flex-col justify-between p-6 bg-background rounded-xl border"
    >
      <div className="w-full flex items-center justify-between space-x-1">
        <p className="font-semibold text-base">{formattedValue}</p>
        {value && trend.value !== "0" ? (
          <div
            className={cn([
              "px-2.5 py-1 rounded-full text-xs font-medium flex space-x-1 items-center",
              {
                "bg-green-100 text-green-foreground": trend.type === "increase",
                "bg-red-100 text-red-foreground": trend.type === "decrease",
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
          </div>
        ) : null}
      </div>
      <p className="text-base leading-6 text-secondary-foreground">{title}</p>
    </div>
  )
}

// NOTE: Mock data
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

const getMonthFromDateString = (dateString: string) => {
  const date = parseISO(dateString)
  const month = getMonth(date) + 1 // 0-indexed

  return INDEXED_MONTHS[month as keyof typeof INDEXED_MONTHS]
}

const groupByMonth = (data: Record<string, number>) => {
  return Object.entries(data).reduce<Record<string, number[]>>(
    (acc, [date, value]) => {
      const month = getMonthFromDateString(date)
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(value)
      return acc
    },
    {},
  )
}
