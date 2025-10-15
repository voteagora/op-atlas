import Image from "next/image"

import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"

interface IncreaseYourImpactProps {
  type: "onchain-builders" | "dev-tooling"
  projectId: string
  isMember: boolean
}
export default function IncreaseYourImpact({
  type,
  projectId,
  isMember,
}: IncreaseYourImpactProps) {
  const isOnchainBuilder = type === "onchain-builders"
  const isDevTooling = type === "dev-tooling"
  return (
    <div className="overflow-hidden relative w-full rounded-lg flex flex-col items-center justify-center bg-[#FF0420] space-y-6 p-20">
      <div className="space-y-3 text-center z-50">
        <h4 className="font-normal text-xl text-contrast-foreground">
          {isOnchainBuilder && "Make your application interoperable"}
          {isDevTooling &&
            "Support developers in building interopable applications"}
        </h4>
        <p className="text-contrast-foreground text-base font-normal">
          {isOnchainBuilder &&
            "Deploy SuperchainERC20 now to enable interoperable assets as soon as Superchain Interop goes live. Tap into the Superchain network effect from day one!"}
          {isDevTooling && "Prepare your Dev Tooling application for interop."}
        </p>
      </div>
      <div className="z-50">
        {isOnchainBuilder && (
          <TrackedExtendedLink
            as="button"
            variant="ghost"
            text="Get started in the Superchain Dev Console"
            href="https://console.optimism.io/getting-started"
            eventName="Link Click"
            eventData={{
              projectId,
              source: "project_page",
              linkName: "Increase Your Impact: Onchain Builders",
              isContributor: isMember,
            }}
          />
        )}
        {isDevTooling && (
          <TrackedExtendedLink
            as="button"
            variant="ghost"
            text="Read Interop Docs"
            href="https://docs.optimism.io/stack/interop/explainer"
            eventName="Link Click"
            eventData={{
              projectId,
              source: "project_page",
              linkName: "Increase Your Impact: Dev Tooling",
              isContributor: isMember,
            }}
          />
        )}
      </div>
    </div>
  )
}
