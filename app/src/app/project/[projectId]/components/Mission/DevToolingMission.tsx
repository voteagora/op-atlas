"use client"
import { AlertTriangleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import { Button } from "@/components/common/Button"
import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { abbreviateNumber, formatNumberWithSeparator } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { MONTHS } from "./constants"

interface DevtoolingMissionProps {
  isMember: boolean
  projectName: string
  data: {
    gasConsumed?: number
    onchainBuildersInAtlasCount?: number
    topProjects?: {
      id: string
      name: string
      website: string[]
      thumbnailUrl: string
    }[]
    opReward?: number | null
    isEligible?: boolean
  }
}

export default function DevToolingMission({
  isMember,
  projectName,
  data,
}: DevtoolingMissionProps) {
  const { setOpenDialog } = useAppDialogs()

  const opReward = data.opReward ?? 0
  const isEligible = data.isEligible ?? false

  function normalizeToTwoDecimals(num: number): number {
    if (num === 0) return 0

    const exponent = Math.floor(Math.log10(Math.abs(num)))
    const normalized = num / Math.pow(10, exponent)

    return Number(normalized.toFixed(2))
  }

  return (
    <div className="space-y-6">
      {opReward > 0 && (
        <div className="mt-6 relative w-full h-64 rounded-xl z-10 overflow-hidden">
          <div className="-top-[1024px] -left-[512px] rounded-full absolute w-[2048px] h-[2048px] bg-gradient-to-br from-[#FF744A78] from-50% to-[#FF5C6C] via-[#FF67B5] animate-slow-spin" />
          <Image
            className="absolute top-0 left-0 z-0 p-0.5 rounded-xl"
            src="/assets/images/rewards-dev-tooling-banner.png"
            objectFit="cover"
            objectPosition="center"
            layout="fill"
            alt="Rewards Banner"
          />
          <Image
            src="/assets/images/rewards-dev-tooling-element.png"
            width={256}
            height={256}
            alt="Dev Tooling"
            className="absolute bottom-0.5 right-0.5 rounded-br-[11px]"
          />

          <div className="absolute w-full h-full z-50">
            <div className="w-full h-full flex items-center justify-center flex-col space-y-6">
              <div className="text-center space-y-3 z-50">
                {/* TODO: Replace this with actual data */}
                <span className="font-extrabold text-4xl">
                  {formatNumberWithSeparator(opReward)} OP
                </span>
                <p className="text-secondary-foreground">
                  Rewards so far in Retro Funding: Onchain Builders
                </p>
              </div>
              {isMember && (
                <Button
                  variant="primary"
                  className="z-50"
                  onClick={() => setOpenDialog("claim_rewards")}
                >
                  Claim your rewards
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
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
          if (!isEligible) {
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
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )
          }

          return (
            <TabsContent
              key={month}
              value={month}
              className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              <MetricCard
                value={normalizeToTwoDecimals(data.gasConsumed ?? 0)}
                title={`Gas consumed by builders using ${projectName}`}
                sign={{ value: " ETH", position: "right" }}
                index={0}
              />
              <MetricCard
                value={abbreviateNumber(data.onchainBuildersInAtlasCount ?? 0)}
                title={`Onchain builders in Atlas using ${projectName}`}
                index={1}
              />
              <div className="w-full col-span-full border rounded-xl p-6 h-[166px]">
                <div className="flex justify-between items-center h-full">
                  <div className="flex flex-col justify-between h-full w-full">
                    <div>
                      <p className="font-semibold text-base text-foreground">
                        Top projects
                      </p>
                      <p className="text-secondary-foreground font-normal text-base">
                        Top projects in Atlas using {projectName}
                      </p>
                    </div>
                    <p className="!text-secondary-foreground">
                      Projects enrolled in Retro Funding: Onchain Builders only
                    </p>
                  </div>
                  <ul className="w-full grid lg:grid-cols-2 grid-cols-1 gap-4">
                    {data.topProjects?.slice(0, 6).map((project, index) => {
                      return (
                        <li key={index} className="space-x-2 flex items-center">
                          <Image
                            src={project.thumbnailUrl}
                            alt={project.name}
                            width={24}
                            height={24}
                          />
                          <Link href={`/project/${project.id}`}>
                            {project.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function MetricCard({
  value,
  title,
  index,
  sign = { value: "", position: "right" },
}: {
  value: string | number
  title: string
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
      </div>
      <p className="text-base leading-6 text-secondary-foreground flex items-start space-x-2">
        <span>{title}</span>
        {!Boolean(value) && (
          <AlertTriangleIcon
            size={16}
            fill="#FF0420"
            className="text-background mt-1 shrink-0"
          />
        )}
      </p>
    </div>
  )
}
