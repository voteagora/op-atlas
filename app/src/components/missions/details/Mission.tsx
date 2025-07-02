"use client"

import React, { useRef } from "react"

import { Eligibility } from "@/components/missions/details/Eligibility"
import { FeaturedProjects } from "@/components/missions/details/FeaturedProjects"
import { GetSupport } from "@/components/missions/details/GetSupport"
import Header from "@/components/missions/details/Header"
import { HowItWorks } from "@/components/missions/details/HowItWorks"
import { LearnMore } from "@/components/missions/details/LearnMore"
import Rewards from "@/components/missions/details/Rewards"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

import { RoundEnrolledProjectsCard } from "./RoundEnrolledProjectsCard"
import { SupportedNetworks } from "./SupportedNetworks"
import { SessionRoundApplicationStatusCard } from "./UserRoundApplicationStatusCard"

// Navigation item component
interface NavItemProps {
  label: string
  targetRef: React.RefObject<HTMLDivElement>
}

const NavItem: React.FC<NavItemProps> = ({ label, targetRef }) => {
  const handleClick = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      onClick={handleClick}
      className="justify-center text-[#636779] hover:text-primary text-sm font-medium leading-tight transition-colors"
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

  // Define all possible navigation sections with their conditions
  const navigationSections: NavSection[] = [
    {
      key: 'about',
      label: 'About',
      ref: aboutRef,
      condition: true // Always show
    },
    {
      key: 'rewards',
      label: 'How rewards are calculated',
      ref: rewardsRef,
      condition: !!mission?.rewards
    },
    {
      key: 'supported-chains',
      label: 'Supported chains',
      ref: supportedChainsRef,
      condition: !!mission?.showSupportedNetworks
    },
    {
      key: 'eligibility',
      label: 'Check your eligibility',
      ref: eligibilityRef,
      condition: !!mission?.missionPageEligibility && mission.missionPageEligibility.length > 0
    },
    {
      key: 'how-it-works',
      label: 'How it works',
      ref: howItWorksRef,
      condition: !!mission?.howItWorks && mission.howItWorks.length > 0
    },
    {
      key: 'featured-projects',
      label: 'Featured projects',
      ref: featuredProjectsRef,
      condition: !!mission?.featuredProjects && mission.featuredProjects.length > 0
    },
    {
      key: 'get-support',
      label: 'Get support',
      ref: getSupportRef,
      condition: !!mission?.supportOptions && mission.supportOptions.length > 0
    },
    {
      key: 'learn-more',
      label: 'Learn more',
      ref: learnMoreRef,
      condition: !!mission?.learnMoreLinks && mission.learnMoreLinks.length > 0
    }
  ]

  // Filter sections based on conditions
  const visibleSections = navigationSections.filter(section => section.condition)

  return (
    <div className="mt-20 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
      <div className="flex flex-1 gap-x-12">
        <div className="flex flex-1 flex-col items-center">
          <div className="flex flex-col gap-y-12 w-[686px]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/missions">
                    Retro Funding Missions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{mission?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-12">
              <div ref={aboutRef}>
                <Header />
              </div>

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

        {mission &&
        mission?.startsAt &&
        new Date() > mission?.startsAt &&
        mission?.endsAt ? (
          <div className="flex flex-col gap-y-6 ml-auto w-[290px] sticky top-40 h-full">
            <>
              <SessionRoundApplicationStatusCard />
              <RoundEnrolledProjectsCard />
              {visibleSections.length > 0 && (
                <div>
                  <p className="font-semibold text-base mb-4">Contents</p>
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
        ) : (
          <div>
            <p className="font-semibold text-base mb-4">Contents</p>
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
      </div>
    </div>
  )
}
