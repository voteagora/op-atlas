"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

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
                see here. We’re continuously working to make more of them
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

const SupportedChainsDesktop = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [open, setOpen] = useState(false)
  const { track } = useAnalytics()

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
  }

  const handleChainClick = (chain: ChainInfo) => {
    track("Link Click", {
      category: "Supported Chains",
      text: chain.name,
      linkUrl: chain.website,
      source: "home_page",
    })
    window.open(chain.website, "_blank")
  }

  const renderImage = (chain: ChainInfo, index: number) => {
    return (
      <div
        key={chain.name}
        className="mx-[-2px] relative group flex items-center justify-center h-14"
        style={{ zIndex: supportedChains.length - index }}
        onClick={() => handleChainClick(chain)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleChainClick(chain)
          }
        }}
      >
        <div className="relative w-10 h-10 group-hover:w-20 group-hover:h-20 group-hover:animate-scale-bounce transition-all duration-200 flex items-center justify-center group-hover:mx-6">
          <Image
            className="rounded-full border border-tertiary cursor-pointer w-full h-full"
            src={chain.logo}
            alt={chain.name}
            width={56}
            height={56}
          />
        </div>
        <div
          className={`absolute top-1/2 border border-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[-1] border-dashed 
            ${index === 0 ? "left-[30px]" : "left-[4px]"} 
            ${
              index === supportedChains.length - 1
                ? "right-[30px]"
                : "right-[4px]"
            }`}
        />
        <div className="w-max -translate-x-1/2 left-1/2 top-[66px] px-3 py-2 inline-flex flex-col justify-center items-center hidden absolute group-hover:block">
          <div className="text-text-foreground text-base font-medium leading-normal">
            {chain.name}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="inline-flex justify-center items-center py-2 w-full">
        <div
          data-property-1="Default"
          className="flex justify-center items-center"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {supportedChains.map((chain, index) => renderImage(chain, index))}
        </div>
      </div>
      <div
        className={cn(
          "text-secondary-foreground text-base font-normal leading-normal mt-2 mb-6",
          isHovering ? "hidden" : "",
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
