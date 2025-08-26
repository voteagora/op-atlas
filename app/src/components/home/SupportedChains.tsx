"use client"

import * as Tooltip from "@radix-ui/react-tooltip"
import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import {
  ChainInfo,
  supportedChains,
} from "@/components/missions/details/SupportedNetworks"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { DialogProps } from "../dialogs/types"
import ExternalLink from "../ExternalLink"
import { Information } from "../icons/remix"
import { Dialog, DialogDrawer } from "../ui/dialog"

const RenderSuperChainInfo = (props: DialogProps<object>) => {
  return (
    <Dialog {...props}>
      <DialogDrawer
        dontShowCloseButton
        className="w-[458px] flex flex-col items-center justify-center text-center"
      >
        <div className="flex flex-col justify-start items-center gap-6 p-6 md:p-0">
          <div className="self-stretch relative bg-[#fbfcfe] rounded-tl-xl rounded-tr-xl flex flex-col justify-start items-start overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <div
                className={cn(
                  "self-stretch text-center justify-center text-[#0f111a] text-xl font-semibold leading-7",
                )}
              >
                19 chains are eligible for rewards with more coming soon
              </div>
              <div className="self-stretch text-center justify-center text-secondary-foreground text-base font-normal leading-normal">
                There are more chains in the Superchain Ecosystem than what you
                see here. We&apos;re continuously working to make more of them
                eligible for grants.
              </div>
            </div>
          </div>
          <div className="flex flex-col self-stretch justify-start items-center gap-2">
            <ExternalLink
              href="https://www.superchain.eco/chains"
              className="self-stretch px-6 py-2.5 bg-[#ff0420] rounded-md inline-flex justify-center items-center gap-2"
            >
              <div className="justify-start text-[#fbfcfe] text-base font-medium leading-normal">
                View the Superchain Index
              </div>
            </ExternalLink>
            <div
              className="self-stretch px-6 py-2.5 bg-[#FBFCFE] rounded-md inline-flex justify-center items-center gap-2 border-[#E0E2EB] border md:hidden"
              onClick={() => props.onOpenChange(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  props.onOpenChange(false)
                }
              }}
            >
              <div className="justify-start text-[#0F111A] text-base font-medium leading-normal">
                Close
              </div>
            </div>
          </div>
        </div>
      </DialogDrawer>
    </Dialog>
  )
}

// Constants for dock animation
const SCALE = 1.8 // max scale factor of an icon
const DISTANCE = 90 // pixels before mouse affects an icon
const NUDGE = 30 // pixels icons are moved away from mouse
const SPRING = {
  mass: 0.1,
  stiffness: 170,
  damping: 12,
}

const ChainIcon = ({
  chain,
  mouseLeft,
  onChainClick,
  showLabel,
  onHover,
}: {
  chain: ChainInfo
  mouseLeft: MotionValue
  onChainClick: (chain: ChainInfo) => void
  showLabel: boolean
  onHover: (chain: ChainInfo | null) => void
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const y = useMotionValue(0)

  const distance = useTransform(() => {
    const bounds = ref.current
      ? { x: ref.current.offsetLeft, width: ref.current.offsetWidth }
      : { x: 0, width: 0 }

    return mouseLeft.get() - bounds.x - bounds.width / 2
  })

  const scale = useTransform(distance, [-DISTANCE, 0, DISTANCE], [1, SCALE, 1])
  const x = useTransform(() => {
    const d = distance.get()
    if (d === -Infinity) {
      return 0
    } else if (d < -DISTANCE || d > DISTANCE) {
      return Math.sign(d) * -1 * NUDGE
    } else {
      return (-d / DISTANCE) * NUDGE * scale.get()
    }
  })

  const scaleSpring = useSpring(scale, SPRING)
  const xSpring = useSpring(x, SPRING)

  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root open={showLabel}>
        <Tooltip.Trigger asChild>
          <motion.button
            ref={ref}
            style={{ x: xSpring, scale: scaleSpring, y }}
            onMouseEnter={() => onHover(chain)}
            onClick={() => {
              animate(y, [0, -30, 0], {
                repeat: 1,
                ease: [
                  [0, 0, 0.2, 1],
                  [0.8, 0, 1, 1],
                ],
                duration: 0.5,
              })
              onChainClick(chain)
            }}
            className="aspect-square block w-10 origin-bottom"
          >
            <Image
              className="rounded-full border border-tertiary cursor-pointer w-full h-full"
              src={chain.logo}
              alt={chain.name}
              width={56}
              height={56}
            />
          </motion.button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={10}
            className="bg-background shadow-lg border border-border px-3 py-1.5 text-sm rounded-md text-foreground font-medium"
          >
            {chain.name}
            <Tooltip.Arrow className="fill-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

const SupportedChainsDesktop = () => {
  const [open, setOpen] = useState(false)
  const [hoveredChain, setHoveredChain] = useState<ChainInfo | null>(null)
  const { track } = useAnalytics()
  const mouseLeft = useMotionValue(-Infinity)
  const mouseRight = useMotionValue(-Infinity)
  const left = useTransform(mouseLeft, [0, 40], [0, -40])
  const right = useTransform(mouseRight, [0, 40], [0, -40])
  const leftSpring = useSpring(left, SPRING)
  const rightSpring = useSpring(right, SPRING)

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
  }

  const handleChainClick = (chain: ChainInfo) => {
    track("Link Click", {
      category: "Supported Chains",
      text: chain.name,
      linkUrl: chain.website,
      source: "home_page",
      elementType: "Icon",
      elementName: chain.name,
    })
    window.open(chain.website, "_blank")
  }

  return (
    <>
      <div className="inline-flex justify-center items-center py-4 w-full">
        <motion.div
          onMouseMove={(e) => {
            const { left, right } = e.currentTarget.getBoundingClientRect()
            const offsetLeft = e.clientX - left
            const offsetRight = right - e.clientX
            mouseLeft.set(offsetLeft)
            mouseRight.set(offsetRight)
          }}
          onMouseLeave={() => {
            mouseLeft.set(-Infinity)
            mouseRight.set(-Infinity)
            setHoveredChain(null)
          }}
          className="relative flex h-16 items-end gap-1 px-3 pb-3"
        >
          <motion.div
            className="absolute rounded-2xl inset-y-0 bg-secondary/10 backdrop-blur-sm border border-border -z-10"
            style={{ left: leftSpring, right: rightSpring }}
          />
          {supportedChains.map((chain) => (
            <ChainIcon
              key={chain.name}
              chain={chain}
              mouseLeft={mouseLeft}
              onChainClick={handleChainClick}
              showLabel={hoveredChain?.name === chain.name}
              onHover={setHoveredChain}
            />
          ))}
        </motion.div>
      </div>
      <div
        className={cn(
          "text-secondary-foreground text-base font-normal leading-normal mt-1 mb-9",
          hoveredChain ? "opacity-0" : "opacity-100",
          "transition-opacity duration-200",
        )}
      >
        19 chains in the Superchain are eligible for builder rewards
        <div
          className="hover:cursor-pointer ml-1.5 inline-flex align-middle"
          onClick={() => handleOpenChange(!open)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleOpenChange(!open)
            }
          }}
        >
          <Information className="w-4 h-4" />
        </div>
      </div>
      <RenderSuperChainInfo open={open} onOpenChange={handleOpenChange} />
    </>
  )
}

// Mobile Component - Using Embla Carousel with loop and selected chain tracking
const SupportedChainsMobile = () => {
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null)
  const [api, setApi] = useState<CarouselApi>()
  const [open, setOpen] = useState(false)
  const [showChains, setShowChains] = useState(false)
  const { track } = useAnalytics()

  const handleOpenChange = (open: boolean) => {
    track("Button Click", {
      text: "Supported Chains",
      source: "home_page",
      button_type: "Dialog",
      category: "Supported Chains",
      elementType: "Div: role=button",
      elementName: "Information",
    })
    setOpen(open)
  }

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      api.scrollTo(selectedIndex)
      setSelectedChain(supportedChains[selectedIndex])
    }

    const selectedIndex = Math.floor(supportedChains.length / 2)
    api.scrollTo(selectedIndex, true)
    setSelectedChain(supportedChains[selectedIndex])
    setShowChains(true)

    // Listen for selection changes
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  const handleChainClick = (chain: ChainInfo) => {
    track("Link Click", {
      category: "Supported Chains",
      text: chain.name,
      linkUrl: chain.website,
      source: "home_page",
      elementType: "Div: role=button",
      elementName: chain.name,
    })
    window.open(chain.website, "_blank")
  }

  const renderImage = (chain: ChainInfo, index: number) => {
    return (
      <CarouselItem key={chain.name} className="basis-1/6">
        <div
          className="flex items-center justify-center h-16 cursor-pointer"
          onClick={() => handleChainClick(chain)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleChainClick(chain)
            }
          }}
        >
          <div className="relative w-12 h-12 transition-all duration-200 flex items-center justify-center">
            <Image
              className="rounded-full border border-tertiary cursor-pointer w-full h-full"
              src={chain.logo}
              alt={chain.name}
              width={48}
              height={48}
            />
          </div>
        </div>
      </CarouselItem>
    )
  }

  return (
    <>
      <div className={cn("relative w-full", showChains ? "" : "hidden")}>
        <div
          className={cn(
            "text-secondary-foreground text-base font-normal leading-normal mb-6 mt-12",
          )}
        >
          19 chains eligible for rewards
          <div
            className="hover:cursor-pointer ml-1.5 inline-flex align-middle"
            onClick={() => handleOpenChange(!open)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleOpenChange(!open)
              }
            }}
          >
            <Information className="w-4 h-4" />
          </div>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
            skipSnaps: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="md:-ml-4">
            {supportedChains.map((chain, index) => renderImage(chain, index))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="text-secondary-foreground text-base font-normal leading-normal mt-2 min-h-[24px] text-center">
        {selectedChain ? selectedChain.name : ""}
      </div>
      <RenderSuperChainInfo open={open} onOpenChange={handleOpenChange} />
    </>
  )
}

// Main Component with responsive rendering
export const SupportedChains = () => {
  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <SupportedChainsDesktop />
      </div>
      {/* Mobile version */}
      <div className="block md:hidden">
        <SupportedChainsMobile />
      </div>
    </>
  )
}
