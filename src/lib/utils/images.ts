import imageCompression from "browser-image-compression"
import { PixelCrop } from "react-image-crop"

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve)
  })
}

export async function uploadImage(image: Blob) {
  const compressed = await compressImage(image)

  const result = await fetch("/api/upload", {
    method: "POST",
    body: compressed,
  })

  if (result.status === 413) {
    // Image was too large
    throw new Error("Image size too large")
  }

  const { url } = await result.json()
  return url as string
}

// Adapted from https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o
export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const pixelRatio = window.devicePixelRatio

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = "high"

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY)
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
}

export async function compressImage(image: Blob) {
  const options = {
    maxSizeMB: 4,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
  }

  return await imageCompression(image as File, options)
}
