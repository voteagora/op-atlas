"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import React from "react"

import ExtendedLink from "@/components/common/TrackedExtendedLink"
import TrackedLink from "@/components/common/TrackedLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/utils"

import { MONTHS } from "@/lib/oso/constants"
import AlertContainer from "./AlertContainer"
import MetricCard from "./MetricCard"
import NotPassingEligibility from "./NotPassingEligibility"
import { OnchainBuilderMissionProps } from "@/lib/oso/types"
import { getIsProjectEligibleByReward } from "@/lib/oso/utils"

export default function OnchainBuilderMission({
  data,
}: {
  data: OnchainBuilderMissionProps
}) {
  const { projectId } = useParams()
  const { projectName, applicationDate, onchainBuilderMetrics, eligibility } =
    data
  const opRewardSum = Object.values(
    onchainBuilderMetrics.onchainBuilderReward,
  ).reduce((acc, curr) => acc + curr, 0)

  return (
    <div className="space-y-3">
      {opRewardSum > 0 && (
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
                  {formatNumber(opRewardSum, 0)} OP
                </span>
                <p className="text-secondary-foreground">
                  Rewards so far in Retro Funding: Onchain Builders
                </p>
              </div>
              {data.isMember && (
                <ExtendedLink
                  as="button"
                  variant="primary"
                  className="z-50"
                  href={`/projects/${projectId}/rewards`}
                  text="Claim your rewards"
                  eventName="Link Click"
                  eventData={{
                    projectId,
                    source: "project_page",
                    isContributor: data.isMember,
                    linkName: "View recipients",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <Tabs defaultValue={MONTHS[0]} className="w-full mt-12">
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto h-fit">
          {MONTHS.map((month, index) => {
            const isFutureMonth = month !== "February" && month !== "March"
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
          if (
            !getIsProjectEligibleByReward(
              onchainBuilderMetrics.onchainBuilderReward[month] ?? 0,
            )
          ) {
            return (
              <TabsContent
                key={month}
                value={month}
                className="w-full data-[state=inactive]:hidden p-10 border borded-[#E0E2EB] rounded-xl mt-3"
              >
                <div className="w-full flex items-center justify-center">
                  <p className="text-foreground font-semibold text-base">
                    {projectName} was not enrolled in {month}
                  </p>
                </div>
              </TabsContent>
            )
          }

          if (!eligibility.onchainBuilderEligibility) {
            return (
              <TabsContent
                key={month}
                value={month}
                className="w-full data-[state=inactive]:hidden p-10 border borded-[#E0E2EB] rounded-xl mt-3"
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
                        transactionsCount={
                          onchainBuilderMetrics.transactions[month]?.value
                        }
                        qualifiedAddressesCount={
                          onchainBuilderMetrics.activeAddresses[month]?.value
                        }
                        distinctDaysCount={
                          onchainBuilderMetrics.activeAddresses[month]?.value
                        }
                        hasDefillamaAdapter={
                          eligibility?.hasDefillamaAdapter ?? false
                        }
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )
          }

          return (
            <TabsContent
              key={month}
              value={month}
              className="w-full grid grid-cols-2 gap-4 data-[state=inactive]:hidden mt-3"
            >
              <MetricCard
                value={formatNumber(
                  onchainBuilderMetrics.tvl[month]?.value,
                  0,
                  "compact",
                )}
                title="TVL across the Superchain"
                trend={{
                  value:
                    onchainBuilderMetrics.tvl[month]?.trend.value.toString(),
                  type:
                    onchainBuilderMetrics.tvl[month]?.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{
                  value:
                    onchainBuilderMetrics.tvl[month]?.value === 0 ? "" : "$",
                  position: "left",
                }}
                index={0}
              />
              <MetricCard
                value={formatNumber(
                  onchainBuilderMetrics.transactions[month]?.value,
                  0,
                  "compact",
                )}
                title="Transactions"
                trend={{
                  value:
                    onchainBuilderMetrics.transactions[
                      month
                    ]?.trend.value.toString(),
                  type:
                    onchainBuilderMetrics.transactions[month]?.trend.sign ===
                    "inc"
                      ? "increase"
                      : "decrease",
                }}
                index={1}
              />
              <MetricCard
                value={formatNumber(
                  onchainBuilderMetrics.gasFees[month]?.value,
                  0,
                )}
                title="Gas consumed"
                trend={{
                  value: formatNumber(
                    onchainBuilderMetrics.gasFees[month]?.trend.value,
                    0,
                    "compact",
                  ),
                  type:
                    onchainBuilderMetrics.gasFees[month]?.trend.sign === "inc"
                      ? "increase"
                      : "decrease",
                }}
                sign={{ value: " ETH", position: "right" }}
                index={2}
              />
              <MetricCard
                value={formatNumber(
                  Math.round(
                    onchainBuilderMetrics.activeAddresses[month]?.value,
                  ),
                  0,
                  "compact",
                )}
                title="Qualified addresses"
                trend={{
                  value:
                    onchainBuilderMetrics.activeAddresses[
                      month
                    ]?.trend.value.toString(),
                  type:
                    onchainBuilderMetrics.activeAddresses[month]?.trend.sign ===
                    "inc"
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
        {data.isMember && !Boolean(eligibility?.hasDefillamaAdapter) && (
          <AlertContainer type="danger" isMember={data.isMember}>
            For TVL rewards,{" "}
            <TrackedLink
              className="underline"
              href={`/projects/${projectId ?? ""}/contracts`}
              eventName="Link Click"
              eventData={{
                projectId: projectId ?? "",
                source: "project_page",
                linkName: "Provide a link to your DeFiLlama adapter",
                isContributor: data.isMember,
              }}
            >
              provide a link to your DeFiLlama adapter
            </TrackedLink>
            .
          </AlertContainer>
        )}
        {eligibility.deployedOnWorldchain && (
          <AlertContainer type="danger" isMember={data.isMember}>
            Qualified addresses may be inaccurate for projects deployed on
            Worldchain. The team is actively working with World to analyze World
            address data.
          </AlertContainer>
        )}
        {!eligibility.onchainBuilderEligibility && (
          <AlertContainer type="danger" isMember={data.isMember}>
            This project didn’t receive OP in February because it didn’t meet
            reward minimums.
          </AlertContainer>
        )}
      </ul>
    </div>
  )
}
