"use client"

import Image from "next/image"
import { ReactNode } from "react"

export const IconList = ({
  icons,
  headerContent,
}: {
  icons: (string | null)[]
  headerContent?: ReactNode
}) => {
  return (
    <div className="flex flex-col p-6">
      {headerContent}

      <div
        className={`flex flex-wrap gap-1 max-h-[120px] overflow-hidden items-start mt-3`}
      >
        {icons.map((icon: string | null, index: number) => {
          return (
            <Image
              src={icon ?? "/assets/images/social-share-background.png"}
              width={44}
              height={44}
              alt="Project"
              key={"projectsEnrolled-" + index}
              className="rounded-lg"
            />
          )
        })}
      </div>
      {icons.length > 10 ? (
        <div className="w-full border-t border-border" />
      ) : (
        <></>
      )}
    </div>
  )
}
