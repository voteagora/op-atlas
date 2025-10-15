"use client"

import Image from "next/image"
import { useParams } from "next/navigation"

import ExtendedLink from "@/components/common/TrackedExtendedLink"
import TrackedLink from "@/components/common/TrackedLink"
import ExternalLink from "@/components/ExternalLink"
import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MONTHS, TRANCHE_MONTHS_MAP } from "@/lib/oso/constants"
import { DevToolingMissionProps } from "@/lib/oso/types"
import { formatNumber } from "@/lib/utils"

import MetricCard from "./MetricCard"

export default function DevToolingMission({
  data,
}: {
  data: DevToolingMissionProps
}) {
  const params = useParams()

  const projectId = params.projectId as string
  const { devToolingMetrics, projectName, eligibility } = data

  const opRewardSum = devToolingMetrics?.devToolingReward
    ? Object.values(devToolingMetrics.devToolingReward).reduce(
        (acc, curr) => acc + curr.value,
        0,
      )
    : 0

  return (
    <div className="space-y-3">
      {opRewardSum > 0 && (
        <div className="mt-4 w-full">
          <div className="w-full bg-[#FFF0F1] rounded-xl p-8">
            <div className="w-full h-full flex items-center justify-center flex-col space-y-6">
              <div className="text-center space-y-3 z-50">
                <span className="font-normal text-4xl">
                  {formatNumber(opRewardSum, 0)} OP
                </span>
                <p className="text-secondary-foreground">
                  Rewards so far in Retro Funding: Dev Tooling
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
        className="w-full mt-6"
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
          if (!eligibility?.devToolingEnrolment[month]) {
            return (
              <TabsContent
                key={month}
                value={month}
                className="w-full data-[state=inactive]:hidden p-10 border borded-[#E0E2EB] rounded-xl mt-3"
              >
                <div className="w-full flex items-center justify-center">
                  <p className="text-foreground font-normal text-base">
                    {projectName} was not enrolled in {month}
                  </p>
                </div>
              </TabsContent>
            )
          }

          if (!eligibility?.devToolingEligibility?.[month]) {
            return (
              <TabsContent
                key={month}
                value={month}
                className="w-full data-[state=inactive]:hidden p-10 border borded-[#E0E2EB] rounded-xl mt-3"
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value="retro-funding" className="w-full">
                    <div className="flex flex-col items-center w-full">
                      <p className="font-normal text-base text-foreground">
                        Requirements to earn rewards in {month} were not met
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
              className="w-full grid grid-cols-2 gap-3 data-[state=inactive]:hidden mt-3"
            >
              <MetricCard
                value={formatNumber(
                  devToolingMetrics?.gasConsumption?.[month]?.value ?? 0,
                )}
                title={`Gas consumed by builders using ${projectName}`}
                sign={{ value: " ETH", position: "right" }}
                index={0}
              />
              <MetricCard
                value={formatNumber(
                  devToolingMetrics?.trustedDevelopersCount?.[month] ?? 0,
                  0,
                  "compact",
                )}
                title={`Trusted developers engaging with ${projectName}`}
                index={1}
              />
              <div className="w-full col-span-full border rounded-xl p-6 min-h-[166px]">
                <div className="flex justify-between items-start h-full">
                  <div className="flex flex-col justify-between h-full w-full">
                    <div>
                      <p className="font-normal text-base text-foreground">
                        Top projects
                      </p>
                      <p className="text-secondary-foreground font-normal text-base">
                        Top projects in Atlas using {projectName}
                      </p>
                    </div>
                    <p className="!text-secondary-foreground text-xs">
                      Projects enrolled in Retro Funding: Onchain Builders only
                    </p>
                  </div>
                  <div className="w-full h-full">
                    <ul className="w-full grid lg:grid-cols-2 grid-cols-1">
                      {devToolingMetrics?.topProjects?.[month]?.map(
                        (project, index) => {
                          return (
                            <TrackedLink
                              href={`/project/${project?.id}`}
                              eventName="Link Click"
                              target="_blank"
                              eventData={{
                                projectId: project?.id,
                                source: "project_page",
                                linkName: "Top Projects",
                              }}
                              key={project?.id || index}
                            >
                              <li className="space-x-2 flex items-center py-[10px] px-3 hover:underline hover:bg-secondary rounded-lg">
                                {project?.thumbnailUrl && (
                                  <Image
                                    src={project.thumbnailUrl}
                                    alt={project?.name ?? ""}
                                    width={24}
                                    height={24}
                                    className="mr-2 mt-[-2px] mb-[-2px]"
                                  />
                                )}
                                <span className="truncate block max-w-[220px]">
                                  {project?.name}
                                </span>
                              </li>
                            </TrackedLink>
                          )
                        },
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-full rounded-xl border p-6 bg-background col-span-full">
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
                        <p className="text-foreground font-normal text-base">
                          {formatNumber(
                            devToolingMetrics?.devToolingReward?.[month]
                              ?.value ?? 0,
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
                        Rewards are determined by an{" "}
                        <ExternalLink
                          href="https://gov.optimism.io/t/evolution-of-retro-funding-in-season-8/10024"
                          className="underline"
                        >
                          evaluation algorithm
                        </ExternalLink>{" "}
                        powered by onchain data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
