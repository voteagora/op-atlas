"use client"

import Image from "next/image"
import { useParams } from "next/navigation"

import ExtendedLink from "@/components/common/TrackedExtendedLink"
import TrackedLink from "@/components/common/TrackedLink"
import ExternalLink from "@/components/ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MONTHS, TRANCHE_MONTHS_MAP } from "@/lib/oso/constants"
import { OnchainBuilderMissionProps } from "@/lib/oso/types"
import { formatNumber } from "@/lib/utils"

import AlertContainer from "./AlertContainer"
import MetricCard from "./MetricCard"
import NotPassingEligibility from "./NotPassingEligibility"

export default function OnchainBuilderMission({
  data,
}: {
  data: OnchainBuilderMissionProps
}) {
  const { projectId } = useParams()
  const { projectName, onchainBuilderMetrics, eligibility } = data

  const opRewardSum = onchainBuilderMetrics?.onchainBuilderReward
    ? Object.values(onchainBuilderMetrics.onchainBuilderReward).reduce(
        (acc, curr) => acc + curr.value,
        0,
      )
    : 0

  return (
    <div className="space-y-3">
      {opRewardSum > 0 && (
        <div className="mt-6 relative w-full rounded-xl z-10 overflow-hidden">
          <div className="absolute w-full h-full z-50 bg-[#FFF0F1] rounded-xl p-20">
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
                    linkName: "Claim your rewards",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <Tabs
        defaultValue={Object.values(TRANCHE_MONTHS_MAP).pop() || ""}
        className="w-full mt-12"
      >
        <TabsList className="bg-transparent space-x-2 flex items-center justify-between overflow-auto h-fit p-0">
          {MONTHS.map((month, index) => {
            const isFutureMonth =
              !Object.values(TRANCHE_MONTHS_MAP).includes(month)
            return (
              <TabsTrigger
                disabled={isFutureMonth}
                key={index}
                value={month}
                className="rounded-lg py-2 px-4 bg-secondary text-secondary-foreground data-[state=active]:border data-[state=active]:border-tertiary w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=disabled]:opacity-50 h-9"
              >
                {month}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {MONTHS.map((month) => {
          if (!eligibility?.onchainBuilderEnrolment[month]) {
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

          if (!eligibility?.onchainBuilderEligibility[month]) {
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
                        Requirements to earn rewards in {month} were not met
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
                          onchainBuilderMetrics?.transactions?.[month]?.value ??
                          0
                        }
                        qualifiedAddressesCount={
                          onchainBuilderMetrics?.activeAddresses?.[month]
                            ?.value ?? 0
                        }
                        distinctDaysCount={
                          onchainBuilderMetrics?.activeAddresses?.[month]
                            ?.value ?? 0
                        }
                        hasDefillamaAdapter={
                          eligibility?.hasDefillamaAdapter?.[month] ?? false
                        }
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )
          }

          return (
            <>
              <TabsContent
                key={month}
                value={month}
                className="w-full grid grid-cols-2 gap-3 data-[state=inactive]:hidden mt-3"
              >
                <MetricCard
                  value={formatNumber(
                    onchainBuilderMetrics?.tvl?.[month]?.value ?? 0,
                    0,
                    "compact",
                  )}
                  title="TVL across the Superchain"
                  trend={{
                    value:
                      onchainBuilderMetrics?.tvl?.[
                        month
                      ]?.trend.value.toString() ?? "0",
                    type:
                      onchainBuilderMetrics?.tvl?.[month]?.trend.sign === "inc"
                        ? "increase"
                        : "decrease",
                  }}
                  sign={{
                    value:
                      onchainBuilderMetrics?.tvl?.[month]?.value === 0
                        ? ""
                        : "$",
                    position: "left",
                  }}
                  index={0}
                />
                <MetricCard
                  value={formatNumber(
                    onchainBuilderMetrics?.transactions?.[month]?.value ?? 0,
                    0,
                    "compact",
                  )}
                  title="Transactions"
                  trend={{
                    value:
                      onchainBuilderMetrics?.transactions?.[
                        month
                      ]?.trend.value.toString() ?? "0",
                    type:
                      onchainBuilderMetrics?.transactions?.[month]?.trend
                        .sign === "inc"
                        ? "increase"
                        : "decrease",
                  }}
                  index={1}
                />
                <MetricCard
                  value={formatNumber(
                    onchainBuilderMetrics?.gasFees?.[month]?.value ?? 0,
                    2,
                  )}
                  title="Gas consumed"
                  trend={{
                    value: formatNumber(
                      onchainBuilderMetrics?.gasFees?.[month]?.trend.value ?? 0,
                      0,
                      "compact",
                    ),
                    type:
                      onchainBuilderMetrics?.gasFees?.[month]?.trend.sign ===
                      "inc"
                        ? "increase"
                        : "decrease",
                  }}
                  sign={{ value: " ETH", position: "right" }}
                  index={2}
                />
                <MetricCard
                  value={formatNumber(
                    Math.round(
                      onchainBuilderMetrics?.activeAddresses?.[month]?.value ??
                        0,
                    ),
                    0,
                    "compact",
                  )}
                  title="Daily Unique addresses"
                  trend={{
                    value:
                      onchainBuilderMetrics?.activeAddresses?.[
                        month
                      ]?.trend.value.toString() ?? "0",
                    type:
                      onchainBuilderMetrics?.activeAddresses?.[month]?.trend
                        .sign === "inc"
                        ? "increase"
                        : "decrease",
                  }}
                  index={3}
                />
                <div className="w-full rounded-xl border p-6 bg-background col-span-full h-32">
                  <div className="w-full h-full flex justify-between">
                    <div className="w-full pr-6">
                      <div className="flex items-center space-x-3">
                        <Image
                          src="/assets/icons/op-icon.svg"
                          alt="Optimism"
                          width={40}
                          height={40}
                        />
                        <div>
                          <p className="text-foreground font-semibold text-base">
                            {formatNumber(
                              onchainBuilderMetrics?.onchainBuilderReward?.[
                                month
                              ]?.value ?? 0,
                              0,
                            )}
                          </p>
                          <p className="text-secondary-foreground text-base font-normal">
                            Rewards for performance in {month}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex">
                      <div className="h-full w-px bg-tertiary" />
                      <div className="pl-6">
                        <p className="text-secondary-foreground text-base font-normal">
                          Rewards are determined by an <ExternalLink href="https://gov.optimism.io/t/evolution-of-retro-funding-in-season-8/10024" className="underline">evaluation algorithm</ExternalLink> powered by onchain data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <ul className="space-y-[8pt]">
                {data.isMember && !eligibility?.hasDefillamaAdapter[month] && (
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
                {!eligibility!.onchainBuilderEligibility && (
                  <AlertContainer type="danger" isMember={data.isMember}>
                    This project didn&apos;t receive OP in {month} because it
                    didn&apos;t meet reward minimums.
                  </AlertContainer>
                )}
              </ul>
            </>
          )
        })}
      </Tabs>
    </div>
  )
}
