"use client"
import { PencilLineIcon } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import ExtendedLink from "@/components/common/ExtendedLink"

interface HeaderProps {
  isMember: boolean
  thumbnail?: string | null
  banner?: string | null
}

export default function Header({ isMember, thumbnail, banner }: HeaderProps) {
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()
  const [bannerSrc, setBannerSrc] = React.useState<string | null | undefined>(
    banner,
  )
  return (
    <div className="w-full relative">
      {bannerSrc && (
        <>
          {isMember && isPending ? (
            <Button
              disabled
              className="absolute top-6 right-6 z-10"
              as="button"
              variant="secondary"
              leftIcon={<PencilLineIcon size={16} fill="#000" />}
            >
              Edit
            </Button>
          ) : (
            <ExtendedLink
              as="button"
              href={`/projects/${params.projectId}/details`}
              text="Edit"
              icon={<PencilLineIcon size={16} fill="#000" />}
              className="absolute top-6 right-6 z-[100]"
            />
          )}
          <div className="flex items-center justify-center w-full h-[280px] rounded-3xl overflow-hidden">
            {isPending && (
              <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-background bg-opacity-[0.025] animate-pulse z-50" />
            )}
            <Image
              src={bannerSrc}
              layout="responsive"
              width={1024}
              height={280}
              objectFit="cover"
              alt="Project banner"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </>
      )}
      {/* TODO: Figure out a way to clip bottom right and top left parts of the banner */}
      {thumbnail && (
        <div className="absolute bottom-0 left-0 bg-background pr-8 pt-8 z-50 rounded-tr-3xl">
          <div className="w-28 aspect-square rounded-3xl overflow-hidden">
            <Image
              src={thumbnail}
              layout="responsive"
              width={112}
              height={112}
              objectFit="cover"
              alt="Project thumbnail"
            />
          </div>
        </div>
      )}
    </div>
  )
}
