"use client"

import { getMonth, parseISO } from "date-fns"
import { CheckIcon, EyeOff, Info, Triangle, XIcon } from "lucide-react"
import { AlertTriangleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { abbreviateNumber, formatNumberWithSeparator } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import {
  DISTINCT_DAYS_THRESHOLD,
  getDaysInMonthByName,
  INDEXED_MONTHS,
  MONTHS,
  QUALIFIED_ADDRESSES_THRESHOLD,
  TRANSACTIONS_THRESHOLD,
} from "./constants"
import { OnchainBuildersDataType } from "./types"

interface DataProps {
  activeAddresses: OnchainBuildersDataType
  gasFees: OnchainBuildersDataType
  transactions: OnchainBuildersDataType
  tvl: OnchainBuildersDataType
  opReward?: number | null
  eligibility: {
    hasDefillamaAdapter: boolean
    hasQualifiedAddresses: boolean
    hasBundleBear: boolean
  }
}

export function OnchainBuilderMission({ data }: { data?: DataProps }) {
  const { setOpenDialog } = useAppDialogs()
  const { projectId } = useParams()

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
      const percentageChange = Math.abs((diff / previous) * 100)

      return {
        value: parseFloat(percentageChange.toFixed(2)),
        sign: diff > 0 ? "inc" : diff < 0 ? "dec" : null,
      }
    }

    return MONTHS.reduce(
      (acc, month, index) => {
        if (index === 0) {
          acc[month] = {
            activeAddresses: {
              value: sum(grouped.activeAddresses[month]),
              trend: { value: 0, sign: null },
            },
            gasFees: {
              value: sum(grouped.gasFees[month]),
              trend: { value: 0, sign: null },
            },
            transactions: {
              value: sum(grouped.transactions[month]),
              trend: { value: 0, sign: null },
            },
            tvl: {
              value: sum(grouped.tvl[month]),
              trend: { value: 0, sign: null },
            },
          }

          return acc
        }

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
    return Number((Math.round(num * 100) / 100).toFixed(2))
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
              <span className="font-extrabold text-4xl">
                {formatNumberWithSeparator(data?.opReward ?? 0)} OP
              </span>
              <p className="text-secondary-foreground">
                Rewards so far in Retro Funding: Onchain Builders
              </p>
            </div>
            <Button
              variant="primary"
              className="z-50"
              onClick={() => setOpenDialog("claim_rewards")}
            >
              Claim your rewards
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue={MONTHS[0]} className="w-full mt-12">
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto h-fit">
          {MONTHS.map((month, index) => {
            const isFutureMonth = month !== "February"
            return (
              <TabsTrigger
                disabled={isFutureMonth}
                key={index}
                value={month}
                className="rounded-lg py-2 px-4 bg-secondary text-secondary-foreground border border-tertiary min-w-36 w-full data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                {month}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {MONTHS.map((month) => {
          const monthMetrics = groupedData[month]
          if (
            monthMetrics.activeAddresses.value <
              QUALIFIED_ADDRESSES_THRESHOLD ||
            monthMetrics.transactions.value < TRANSACTIONS_THRESHOLD ||
            monthMetrics.activeAddresses.value < DISTINCT_DAYS_THRESHOLD
          ) {
            return (
              <TabsContent
                key={month}
                value={month}
                className="w-full data-[state=inactive]:hidden p-10 border borded-[#E0E2EB] rounded-xl"
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value="retro-funding" className="w-full">
                    <div className="flex flex-col items-center w-full">
                      <p className="font-semibold text-base text-foreground">
                        Requirements to earn rewards in February were not met
                      </p>
                      <div className="flex items-center space-x-1">
                        <p className="text-secondary-foreground text-base font-normal">
                          Measured over the last 180 days
                        </p>
                        <AccordionTrigger />
                      </div>
                    </div>
                    <AccordionContent className="pt-6">
                      <NotPassingEligibility
                        month={month}
                        transactionsCount={monthMetrics.transactions.value}
                        qualifiedAddressesCount={
                          monthMetrics.activeAddresses.value
                        }
                        distinctDaysCount={monthMetrics.activeAddresses.value}
                        hasDefillamaAdapter={
                          data?.eligibility.hasDefillamaAdapter ?? false
                        }
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )
          }

          const numOfDaysInMonth = getDaysInMonthByName(
            month,
            new Date().getFullYear(),
          )
          const avgTVL = monthMetrics.tvl.value / numOfDaysInMonth
          const avgQualifiedAddresses =
            monthMetrics.activeAddresses.value / numOfDaysInMonth

          return (
            <TabsContent
              key={month}
              value={month}
              className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              <MetricCard
                value={abbreviateNumber(avgTVL)}
                title="TVL across the Superchain"
                trend={{
                  value: monthMetrics.tvl.trend.value.toString(),
                  type:
                    monthMetrics.tvl.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{
                  value: monthMetrics.tvl.value === 0 ? "" : "$",
                  position: "left",
                }}
                index={0}
              />
              <MetricCard
                value={abbreviateNumber(monthMetrics.transactions.value)}
                title="Transactions"
                trend={{
                  value: monthMetrics.transactions.trend.value.toString(),
                  type:
                    monthMetrics.transactions.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                index={1}
              />
              <MetricCard
                value={normalizeToTwoDecimals(monthMetrics.gasFees.value)}
                title="Gas consumed"
                trend={{
                  value: normalizeToTwoDecimals(
                    monthMetrics.gasFees.trend.value,
                  ).toString(),
                  type:
                    monthMetrics.gasFees.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{ value: " ETH", position: "right" }}
                index={2}
              />
              <MetricCard
                value={abbreviateNumber(Math.round(avgQualifiedAddresses))}
                title="Qualified addresses"
                trend={{
                  value: monthMetrics.activeAddresses.trend.value.toString(),
                  type:
                    monthMetrics.activeAddresses.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                index={3}
              />
            </TabsContent>
          )
        })}
      </Tabs>
      <ul className="space-y-[8pt]">
        {!Boolean(data?.eligibility.hasDefillamaAdapter) && (
          <AlertContainer type="danger">
            For TVL rewards,{" "}
            <Link
              className="underline"
              href={`/projects/${projectId ?? ""}/details`}
            >
              provide a link to your DeFiLlama adapter
            </Link>
            .
          </AlertContainer>
        )}
        {!Boolean(data?.eligibility.hasBundleBear) && (
          <AlertContainer type="danger">
            Qualified addresses may be inaccurate for projects deployed on
            Worldchain. The team is actively working with World to analyze World
            address data.
          </AlertContainer>
        )}
        {Boolean(data?.eligibility.hasBundleBear) && (
          <AlertContainer type="info">
            {/* TODO: Where does this lead? */}
            If you are using ERC-4337: Account Abstraction, then{" "}
            <Link className="underline" href={"#"}>
              add your contracts to BundleBear
            </Link>{" "}
            for extra rewards.
          </AlertContainer>
        )}
      </ul>
    </div>
  )
}

function AlertContainer({
  children,
  type,
}: {
  children: React.ReactNode
  type: "info" | "danger"
}) {
  return (
    <li className="group flex items-start space-x-1 text-secondary-foreground text-sm font-normal">
      {type === "danger" && (
        <AlertTriangleIcon
          size={16}
          fill="#FF0420"
          className="text-background mt-0.5 shrink-0"
        />
      )}
      {type === "info" && (
        <Info size={16} fill="#404454" className="text-background mt-0.5" />
      )}
      <p className="!text-secondary-foreground !text-sm !font-normal">
        {children}
      </p>
      <button>
        <EyeOff
          size={16}
          className="group-hover:opacity-100 transition-all duration-300 opacity-0"
        />
      </button>
    </li>
  )
}

function NotPassingEligibility({
  month,
  transactionsCount,
  qualifiedAddressesCount,
  distinctDaysCount,
  hasDefillamaAdapter,
}: {
  month: string
  transactionsCount: number
  qualifiedAddressesCount: number
  distinctDaysCount: number
  hasDefillamaAdapter: boolean
}) {
  return (
    <div className="w-full grid lg:grid-cols-2 gap-4 grid-cols-1 data-[state=inactive]:hidden">
      <NotPassingEligibilityContainer
        title="At least 1000 transactions"
        projectValue={transactionsCount}
        passed={transactionsCount >= 1000}
      />
      <NotPassingEligibilityContainer
        title="At least 420 qualified addresses"
        projectValue={qualifiedAddressesCount}
        passed={qualifiedAddressesCount >= 420}
      />
      <NotPassingEligibilityContainer
        title="At least 10 distinct days"
        projectValue={distinctDaysCount}
        passed={distinctDaysCount >= 10}
      />
      <NotPassingEligibilityContainer
        title="Defillama adapter"
        projectValue={hasDefillamaAdapter}
        passed={hasDefillamaAdapter}
      />
    </div>
  )
}

function NotPassingEligibilityContainer({
  title,
  passed,
  projectValue,
}: {
  title: string
  passed: boolean
  projectValue: number | boolean
}) {
  return (
    <div className="w-full flex items-center space-x-2 p-6 bg-background rounded-xl border">
      {passed ? (
        <CheckIcon size={24} className="text-[#0DA529]" />
      ) : (
        <XIcon size={24} className="text-[#FF0420]" />
      )}
      <div>
        <p className="font-medium text-base text-foreground">{title}</p>
        <p className="text-secondary-foreground text-base">
          This project:{" "}
          {typeof projectValue === "number"
            ? projectValue === 0
              ? 0
              : abbreviateNumber(projectValue)
            : projectValue
            ? "Pass"
            : "Fail"}
        </p>
      </div>
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
            <span>{trend.value}%</span>
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
      <p className="text-base leading-6 text-secondary-foreground flex items-center space-x-2">
        <span>{title}</span>
        {!Boolean(value) && (
          <AlertTriangleIcon
            size={16}
            fill="#FF0420"
            className="text-background shrink-0"
          />
        )}
      </p>
    </div>
  )
}

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
