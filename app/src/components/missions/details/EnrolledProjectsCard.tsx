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
    <div className="flex flex-col gap-y-3 p-6">
      {headerContent}

      <div
        className={`flex flex-wrap gap-1 max-h-[120px] rounded-lg overflow-hidden items-start`}
      >
        {icons.map((icon: any, index: number) => {
          return (
            <Image
              src={icon}
              width={44}
              height={44}
              alt="Project"
              key={"projectsEnrolled-" + index}
            />
          )
        })}
      </div>
      {icons.length > 10 ? (
        <div className="w-full bg-gray-300 h-[2px]" />
      ) : (
        <></>
      )}
    </div>
  )
}
