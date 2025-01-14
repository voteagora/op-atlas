import Image from "next/image"

import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

export function VideoCallout({
  text,
  imageSrc = "/assets/icons/video-icon.png",
  rightHandComponents, //= <p className="text-blue-800">Watch video</p>,
}: {
  text: string
  imageSrc?: string
  rightHandComponents?: any
}) {
  return Callout({ text, imageSrc, rightHandComponents })
}

export function DocumentCallout({
  text,
  imageSrc = "/assets/icons/doc-icon.png",
  rightHandComponents,
}: {
  text: string
  imageSrc?: string
  rightHandComponents?: any
}) {
  return Callout({ text, imageSrc, rightHandComponents })
}

export function Callout({
  text,
  imageSrc,
  rightHandComponents,
}: {
  text: string
  imageSrc: string
  rightHandComponents?: any
}) {
  return (
    <div
      className={cn(
        "bg-calloutAlternative-foreground flex flex-col gap-y-6 w-full max-w-4xl rounded-lg py-2 px-4",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Image
            src={imageSrc}
            width={128}
            height={128}
            alt="Sunny"
            className="h-6 w-6"
          />
          <div>
            <span className="text-blue-800">{text}</span>{" "}
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex text-blue-800">{rightHandComponents}</div>

          <div className="w-6 h-6 flex items-center justify-center">
            <ArrowUpRight width={18} height={18} color="blue" />
          </div>
        </div>
      </div>
    </div>
  )
}
