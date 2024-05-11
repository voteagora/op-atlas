"use client"

import Image from "next/image"
import { redirect, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/common/Badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export default function Welcome() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currIndex, setCurrIndex] = useState(0)
  const router = useRouter()
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/")
    }
  }, [status])

  const onNext = () => {
    if (!carouselApi) return

    if (carouselApi.canScrollNext()) {
      carouselApi.scrollNext()
      setCurrIndex((i) => i + 1)
    } else {
      setLoadingDashboard(true)
      router.push("/dashboard")
    }
  }

  const isLastCard = carouselApi && !carouselApi.canScrollNext()

  return (
    <div className="flex flex-col items-center pt-20 pb-4 bg-backgroundSecondary min-h-lvh">
      <div className="bg-background w-2/3 max-w-4xl p-16 text-center rounded-3xl items-center flex flex-col gap-6">
        <Badge text="Welcome" size="lg" />
        <Carousel setApi={setCarouselApi}>
          <CarouselContent>
            <WelcomeCard card="intro" />
            <WelcomeCard card="projects" />
            <WelcomeCard card="funding" />
          </CarouselContent>
        </Carousel>
        <Dots total={3} current={currIndex} />
        <Button
          isLoading={loadingDashboard}
          className={
            isLastCard
              ? "bg-optimismRed hover:bg-optimismRed w-24"
              : "bg-backgroundSecondary hover:bg-backgroundSecondary w-24 text-black"
          }
          onClick={onNext}
        >
          {isLastCard ? "Let’s go" : "Next"}
        </Button>
      </div>
    </div>
  )
}

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-3">
      {Array.from(Array(total).keys()).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            current === i ? "bg-foreground" : "bg-backgroundSecondary"
          }`}
        />
      ))}
    </div>
  )
}

const CARD_DETAILS = {
  intro: {
    title: "Welcome to your Optimist profile!",
    description:
      "This is where you’ll manage your projects and apply for Retroactive Public Goods Funding (Retro Funding).",
    image: "/assets/images/welcome-graphic-1.png",
  },
  projects: {
    title: "Add or join projects",
    description:
      "In projects you can add team members, add code repos, and verify your onchain contracts.",
    image: "/assets/images/welcome-graphic-2.png",
  },
  funding: {
    title: "Apply for Retro Funding",
    description:
      "Once you’ve setup your projects, you can apply for Retro Funding.",
    image: "/assets/images/welcome-graphic-3.png",
  },
}

function WelcomeCard({ card }: { card: keyof typeof CARD_DETAILS }) {
  return (
    <CarouselItem>
      <div className="flex flex-col gap-6 items-center text-center">
        <Image
          src={CARD_DETAILS[card].image}
          alt="Cute little blobs doing cute little things"
          width={300}
          height={150}
        />
        <div className="flex flex-col gap-3">
          <div className="text-lg font-semibold">
            {CARD_DETAILS[card].title}
          </div>
          <div className="text-lg">{CARD_DETAILS[card].description}</div>
        </div>
      </div>
    </CarouselItem>
  )
}
