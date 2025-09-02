"use client"

import React, { useMemo, useRef } from "react"

import ExternalLink from "@/components/ExternalLink"
import { Eligibility } from "@/components/missions/details/Eligibility"
import { FeaturedProjects } from "@/components/missions/details/FeaturedProjects"
import { GetSupport } from "@/components/missions/details/GetSupport"
import Header from "@/components/missions/details/Header"
import { HowItWorks } from "@/components/missions/details/HowItWorks"
import { LearnMore } from "@/components/missions/details/LearnMore"
import Rewards from "@/components/missions/details/Rewards"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"

import { MissionStatus } from "./MissionStatus"
import { SupportedNetworks } from "./SupportedNetworks"
import { SessionRoundApplicationStatusCard } from "./UserRoundApplicationStatusCard"

// Navigation item component
interface NavItemProps {
  label: string
  targetRef: React.RefObject<HTMLDivElement>
}

const NavItem: React.FC<NavItemProps> = ({ label, targetRef }) => {
  const handleClick = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <button
      onClick={handleClick}
      className="justify-center text-[#636779] hover:underline text-sm font-medium leading-tight transition-colors"
    >
      {label}
    </button>
  )
}

interface NavSection {
  key: string
  label: string
  ref: React.RefObject<HTMLDivElement>
  condition: boolean
}

export default function Mission() {
  const mission = useMissionFromPath()

  // Create refs for potential sections
  const aboutRef = useRef<HTMLDivElement>(null)
  const rewardsRef = useRef<HTMLDivElement>(null)
  const supportedChainsRef = useRef<HTMLDivElement>(null)
  const eligibilityRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const featuredProjectsRef = useRef<HTMLDivElement>(null)
  const getSupportRef = useRef<HTMLDivElement>(null)
  const learnMoreRef = useRef<HTMLDivElement>(null)
  const missionStatusRef = useRef<HTMLDivElement>(null)

  // Define all possible navigation sections with their conditions
  const navigationSections: NavSection[] = useMemo(
    () => [
      {
        key: "about",
        label: "About",
        ref: aboutRef,
        condition: true, // Always show
      },
      {
        key: "mission-status",
        label: "Status of missions",
        ref: missionStatusRef,
        condition: mission?.pageName === "foundation-missions",
      },
      {
        key: "rewards",
        label: "How impact is measured",
        ref: rewardsRef,
        condition: !!mission?.rewards,
      },
      {
        key: "supported-chains",
        label: "Supported chains",
        ref: supportedChainsRef,
        condition: !!mission?.showSupportedNetworks,
      },
      {
        key: "eligibility",
        label: "Check your eligibility",
        ref: eligibilityRef,
        condition:
          !!mission?.missionPageEligibility &&
          mission.missionPageEligibility.length > 0,
      },
      {
        key: "how-it-works",
        label: "How it works",
        ref: howItWorksRef,
        condition: !!mission?.howItWorks && mission.howItWorks.length > 0,
      },
      {
        key: "featured-projects",
        label: "Featured projects",
        ref: featuredProjectsRef,
        condition:
          !!mission?.featuredProjects && mission.featuredProjects.length > 0,
      },
      {
        key: "get-support",
        label: "Get support",
        ref: getSupportRef,
        condition:
          !!mission?.supportOptions && mission.supportOptions.length > 0,
      },
      {
        key: "learn-more",
        label: "Learn more",
        ref: learnMoreRef,
        condition:
          !!mission?.learnMoreLinks && mission.learnMoreLinks.length > 0,
      },
    ],
    [mission],
  )

  // Filter sections based on conditions
  const visibleSections = navigationSections.filter(
    (section) => section.condition,
  )
  const missionIsOpen =
    mission &&
    mission?.startsAt &&
    new Date() > mission?.startsAt &&
    mission?.endsAt
  const showSidePanel =
    missionIsOpen ||
    mission?.pageName === "audit-grants" ||
    mission?.pageName === "growth-grants"
  return (
    <div
      className={cn(
        "mt-12 md:mt-20 bg-background flex flex-col w-full max-w-[1064px] rounded-3xl z-10",
        showSidePanel ? "mb-24 sm:mb-0" : "",
      )}
    >
      <div className="px-6 md:px-0 flex flex-1 gap-x-12">
        <div className="flex flex-1 flex-col items-center">
          <div className="flex flex-col gap-y-12 max-w-[712px]">
            <div className="flex flex-col gap-12">
              <div ref={aboutRef}>
                <Header />
              </div>

              {mission?.pageName === "foundation-missions" && (
                <div ref={missionStatusRef} className="scroll-mt-20">
                  <MissionStatus />
                </div>
              )}

              {mission?.rewards && (
                <div ref={rewardsRef} className="scroll-mt-20">
                  <Rewards />
                </div>
              )}

              {mission?.showSupportedNetworks && (
                <div ref={supportedChainsRef} className="scroll-mt-20">
                  <SupportedNetworks />
                </div>
              )}

              {mission?.missionPageEligibility &&
                mission.missionPageEligibility.length > 0 && (
                  <div ref={eligibilityRef} className="scroll-mt-20">
                    <Eligibility />
                  </div>
                )}

              {mission?.howItWorks && mission.howItWorks.length > 0 && (
                <div ref={howItWorksRef} className="scroll-mt-20">
                  <HowItWorks />
                </div>
              )}

              {mission?.featuredProjects &&
                mission.featuredProjects.length > 0 && (
                  <div ref={featuredProjectsRef} className="scroll-mt-20">
                    <FeaturedProjects />
                  </div>
                )}

              {mission?.supportOptions && mission.supportOptions.length > 0 && (
                <div ref={getSupportRef} className="scroll-mt-20">
                  <GetSupport />
                </div>
              )}

              {mission?.learnMoreLinks && mission.learnMoreLinks.length > 0 && (
                <div ref={learnMoreRef} className="scroll-mt-20">
                  <LearnMore links={mission.learnMoreLinks} />
                </div>
              )}

              {mission?.footer}
            </div>
          </div>
        </div>

        <div className="fixed md:sticky md:top-40 bottom-0 left-0 right-0 w-full max-w-full md:max-w-[304px] md:ml-auto bg-background md:bg-transparent z-10 shadow-lg md:shadow-none  md:h-fit">
          <>
            {showSidePanel && (
              <div className="flex flex-col gap-y-4">
                <SessionRoundApplicationStatusCard />
                {mission?.pageName === "audit-grants" && (
                  <div className="py-2.5 hidden md:block">
                    <p className="text-secondary-foreground text-sm text-center font-medium leading-tight">
                      Are you an ASP?{" "}
                      <ExternalLink
                        className="text-primary underline font-normal"
                        href="https://app.opgrants.io/programs/958/apply"
                      >
                        Apply here
                      </ExternalLink>
                    </p>
                  </div>
                )}
              </div>
            )}
            {visibleSections.length > 0 && (
              <div className="hidden md:block">
                <p className="font-medium text-sm mb-6 mt-6">Contents</p>
                <nav className="self-stretch px-6 border-l border-tertiary inline-flex flex-col justify-start items-start gap-3">
                  {visibleSections.map((section) => (
                    <NavItem
                      key={section.key}
                      label={section.label}
                      targetRef={section.ref}
                    />
                  ))}
                </nav>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  )
}
