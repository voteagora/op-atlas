"use client"
import { PencilLineIcon } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import ExtendedLink from "@/components/common/ExtendedLink"

interface HeaderProps {
  isMember?: boolean
  thumbnail?: string | null
  banner?: string | null
}

export default function Header({ isMember, thumbnail, banner }: HeaderProps) {
  const params = useParams()

  return (
    <div className="w-full relative">
      {banner && (
        <>
          {isMember && (
            <ExtendedLink
              as="button"
              href={`/projects/${params.projectId}/details`}
              text="Edit"
              icon={<PencilLineIcon size={16} fill="#000" />}
              className="absolute top-9 right-6 z-[100]"
            />
          )}
          <div className="flex items-center justify-center w-full h-[280px]">
            <Image
              src={banner}
              layout="responsive"
              width={1024}
              height={280}
              objectFit="cover"
              alt="Project banner"
              className="w-full h-full object-cover object-center rounded-2xl"
            />
          </div>
        </>
      )}
      {thumbnail && (
        <div className="absolute -bottom-10 left-12 w-28 aspect-square rounded-xl overflow-hidden border-2 border-background">
          <Image
            src={thumbnail}
            layout="responsive"
            width={112}
            height={112}
            objectFit="cover"
            alt="Project thumbnail"
          />
        </div>
      )}
    </div>
  )
}
