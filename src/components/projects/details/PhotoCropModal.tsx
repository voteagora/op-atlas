import "react-image-crop/dist/ReactCrop.css"

import { ReactEventHandler, useState } from "react"
import ReactCrop, {
  centerCrop,
  type Crop,
  makeAspectCrop,
} from "react-image-crop"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

export function PhotoCropModal({
  image,
  open,
  onOpenChange,
  aspectRatio,
  title,
}: DialogProps<{ image: string; aspectRatio?: number; title: string }>) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-0 flex flex-col">
        <DialogHeader className="items-center px-6">
          <h3>{title}</h3>
          <div className="text-secondary-foreground">
            At least 280w x 280h px. No larger than 5MB.
          </div>
        </DialogHeader>
        <div className="flex items-center justify-center h-96 relative self-stretch bg-black">
          <ReactCrop aspect={aspectRatio} crop={crop} onChange={setCrop}>
            {/* ReactCrop does not play nicely with NextJS Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Uploaded" onLoad={onImageLoad} />
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
              // TODO: upload photo here
              console.log("crop values", crop)
              onOpenChange(false)
            }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
