import Image from "next/image"

import { cn } from "@/lib/utils"

export function VideoCallout({ text }: { text: string }) {
  return (
    <div
      className={cn(
        "bg-calloutAlternative-foreground flex flex-col gap-y-6 w-full max-w-4xl rounded-lg py-2 px-4",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Image
            src={"/assets/icons/video-icon.png"}
            width={1}
            height={1}
            alt="Sunny"
            className="h-4 w-4"
          />
          <div>
            <span className="text-blue-800">{text}</span>{" "}
          </div>
        </div>

        <div className="flex items-center">
          <p className="text-blue-800">Watch video</p>
          <div className="w-6 h-6 flex items-center justify-center">
            <Image
              src="/assets/icons/arrow-up-right.svg"
              width={12}
              height={12}
              alt="External link"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
