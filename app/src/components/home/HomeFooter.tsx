"use client"

import TrackedLink from "../common/TrackedLink"
import { ArrowRightUp } from "../icons/remix"

export const HomeFooter = () => {
  return (
    <div className="w-full pt-20 pb-40 bg-[#0f111a] inline-flex flex-col items-center gap-6">
      <div className="flex flex-col gap-2 text-center">
        <div className="self-stretch text-contrast-foreground text-xl font-normal leading-7">
          New to Optimism?
        </div>
        <div className="self-stretch text-[#f2f3f8] text-base font-normal leading-normal">
          Get started with the number one most used blockchain infrastructure.
        </div>
      </div>
      <div className="inline-flex items-center gap-3">
        <TrackedLink
          href="https://docs.optimism.io/operators/chain-operators/self-hosted"
          className="px-4 py-2.5 bg-[#f2f3f8] rounded-md flex gap-2 hover:opacity-80 cursor-pointer"
          eventName="Deploy Chain Click"
          eventData={{
            source: "home_page",
            linkName: "Deploy a chain",
            linkUrl:
              "https://docs.optimism.io/operators/chain-operators/self-hosted",
            category: "Footer",
          }}
          target="_blank"
        >
          <span className="text-[#0f111a] text-sm font-normal leading-tight">
            Deploy a chain
          </span>
          <ArrowRightUp className="w-4 h-4" />
        </TrackedLink>
        <TrackedLink
          href="https://console.optimism.io/getting-started"
          className="px-4 py-2.5 bg-[#f2f3f8] rounded-md flex gap-2 hover:opacity-80 cursor-pointer"
          eventName="Build App Click"
          eventData={{
            source: "home_page",
            linkName: "Build an app",
            linkUrl: "https://console.optimism.io/getting-started",
            category: "Footer",
          }}
          target="_blank"
        >
          <span className="text-[#0f111a] text-sm font-normal leading-tight">
            Build an app
          </span>
          <ArrowRightUp className="w-4 h-4" />
        </TrackedLink>
      </div>
      <TrackedLink
        href="https://optimism.io"
        className="text-center text-[#bcbfcd] text-sm font-normal underline leading-tight"
        eventName="Learn More Click"
        eventData={{
          source: "home_page",
          linkName: "Learn more at optimism.io",
          linkUrl: "https://optimism.io",
          category: "Footer",
        }}
        target="_blank"
      >
        Learn more at optimism.io
      </TrackedLink>
    </div>
  )
}
