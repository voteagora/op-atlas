"use client"
import { PencilLineIcon } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import FileUploadInput from "@/components/common/FileUploadInput"
import { updateBannerAction } from "@/lib/actions/projects"
import { uploadImage } from "@/lib/utils/images"

interface HeaderProps {
  thumbnail?: string | null
  banner?: string | null
}

export default function Header({ thumbnail, banner }: HeaderProps) {
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()
  const [bannerSrc, setBannerSrc] = React.useState<string | null | undefined>(
    banner,
  )
  return (
    <div className="w-full relative">
      {bannerSrc && (
        <>
          {isPending ? (
            <Button
              disabled
              className="absolute top-6 right-6 z-[100]"
              as="button"
              variant="secondary"
              leftIcon={<PencilLineIcon size={16} fill="#000" />}
            >
              Edit
            </Button>
          ) : (
            <FileUploadInput
              className="absolute top-6 right-6 z-[100]"
              onChange={async (e) => {
                if (!e.target.files || e.target.files.length < 1) return

                const file = e.target.files[0]
                setBannerSrc(URL.createObjectURL(file))

                try {
                  startTransition(async () => {
                    const bannerUrl = await uploadImage(file)
                    await updateBannerAction(
                      params.projectId as string,
                      bannerUrl,
                    )
                  })
                } catch (error) {
                  console.error(error)
                  setBannerSrc(banner)
                }
              }}
            >
              <Button
                as="button"
                variant="secondary"
                leftIcon={<PencilLineIcon size={16} fill="#000" />}
              >
                Edit
              </Button>
            </FileUploadInput>
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
