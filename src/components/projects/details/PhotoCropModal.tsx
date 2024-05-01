import "react-image-crop/dist/ReactCrop.css"

import { ReactEventHandler, useCallback, useRef, useState } from "react"
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  type Crop,
  makeAspectCrop,
} from "react-image-crop"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { canvasPreview, toBlob } from "@/lib/imageUtils"

type Props = DialogProps<{
  image: string
  aspectRatio?: number
  title: string
}> & {
  onComplete: (image: Blob) => void
}

export function PhotoCropModal({
  image,
  open,
  onOpenChange,
  onComplete,
  aspectRatio,
  title,
}: Props) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()

  const onImageLoad: ReactEventHandler<HTMLImageElement> = (e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    const defaultCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspectRatio ?? 16 / 9,
        width,
        height,
      ),
      width,
      height,
    )

    setCrop(defaultCrop)
  }

  const onSave = useCallback(async () => {
    if (!imageRef.current || !crop) {
      return
    }

    // Generate the cropped image so that we can upload it later
    const canvas = document.createElement("canvas")
    canvasPreview(
      imageRef.current,
      canvas,
      convertToPixelCrop(crop, imageRef.current.width, imageRef.current.height),
    )

    const blob = await toBlob(canvas)
    if (blob) {
      onComplete(blob)
      onOpenChange(false)
    }
  }, [crop, onComplete, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-0 flex flex-col">
        <DialogHeader className="items-center px-6">
          <h3>{title}</h3>
          <div className="text-secondary-foreground">
            At least 280w x 280h px. No larger than 5MB.
          </div>
        </DialogHeader>
        <div className="flex items-center justify-center h-96 w-full relative bg-black">
          <ReactCrop
            crop={crop}
            aspect={aspectRatio}
            onChange={(crop, percentCrop) => setCrop(percentCrop)}
            className="max-h-96 max-w-full"
          >
            {/* ReactCrop does not play nicely with NextJS Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={image}
              alt="Uploaded"
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="flex gap-2 px-6">
          <Button
            className="flex-1"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            type="button"
            variant="destructive"
            onClick={() => {
              console.log("crop values", crop)
              onSave()
            }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
