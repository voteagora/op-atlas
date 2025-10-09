"use client"

import ExtendedLink from "@/components/common/ExtendedLink"

export default function Error() {
  return (
    <div className="flex flex-col items-center gap-6 h-app w-full justify-center lg:px-0 px-2">
      <h4 className="text-black font-normal">
        Something went wrong. Please try again.
      </h4>

      <div className="flex flex-wrap gap-3">
        <ExtendedLink
          as="button"
          text={"Retry"}
          href={"#"}
          onClick={() => window.location.reload()}
        />
      </div>
    </div>
  )
}
