import { ArrowUpRightIcon, ChevronRight } from "lucide-react"
import { Callout } from "../common/Callout"
import Image from "next/image"
import ExternalLink from "../ExternalLink"

export function NewIn2025Callout() {
  return (
    <Callout
      type="optimismBright"
      showIcon={false}
      className="mt-10"
      leftAlignedContent={
        <div className="flex gap-4 items-center p-3">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-red.svg"}
            width={56}
            height={56}
            className="w-14 h-14"
          />

          <div>
            <span className="font-bold pr-1">New in 2025:</span>
            <span className="pr-1">
              The Retro Funding program is transitioning from annual rounds to
              ongoing impact evaluation and regular rewards, offering builders
              greater consistency and predictability.
            </span>
            <ExternalLink
              href={
                "https://gov.optimism.io/t/season-7-retro-funding-missions/9295/1"
              }
              className="underline"
            >
              Learn more
            </ExternalLink>
          </div>
        </div>
      }
    />
  )
}

export function VideoCallout({ text, href }: { text: string; href: string }) {
  return (
    <ExternalLink href={href}>
      <Callout
        type="info"
        showIcon={false}
        className="mt-10 py-2"
        leftAlignedContent={
          <div className="flex gap-4 items-center">
            <Image
              alt="Info"
              src={"/assets/icons/video-icon.svg"}
              width={10}
              height={10}
              className="w-5 h-5"
            />

            <p>{text}</p>
          </div>
        }
        rightAlignedContent={
          <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
            <ArrowUpRightIcon width={16} height={16} />
          </div>
        }
      />
    </ExternalLink>
  )
}

export function DocumentCallout({
  text,
  href,
}: {
  text: string
  href: string
}) {
  return (
    <ExternalLink href={href}>
      <Callout
        type="info"
        showIcon={false}
        className="mt-10 py-2"
        leftAlignedContent={
          <div className="flex gap-4 items-center">
            <Image
              alt="Info"
              src={"/assets/icons/doc-icon.svg"}
              width={10}
              height={10}
              className="w-5 h-5"
            />

            <p>{text}</p>
          </div>
        }
        rightAlignedContent={
          <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
            <ArrowUpRightIcon width={16} height={16} />
          </div>
        }
      />
    </ExternalLink>
  )
}

export function EnrolledCallout({ name }: { name: string }) {
  return (
    <Callout
      type="success"
      showIcon={false}
      leftAlignedContent={
        <div className="flex">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-smiling.png"}
            width={20}
            height={20}
          />
          <p className="text-sm font-medium mr-5 ml-2">
            {`Enrolled in Retro Funding: ` + name}
          </p>
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
          <span>Confirmation</span>
          <ChevronRight width={16} height={16} />
          <span>Rewards</span>
          <ChevronRight width={16} height={16} />
        </div>
      }
    />
  )
}
