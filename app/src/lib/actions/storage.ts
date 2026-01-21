/**
 * Interface for uploading and manipulating images
 */

"use server"

import { uploadToBucket } from "../google"
import { withImpersonationProtection } from "@/lib/impersonationContext"

export const uploadImage = async (image: Blob): Promise<string> => {
  const filename = `${crypto.randomUUID()}.png`
  return withImpersonationProtection(
    "Storage",
    `Upload image ${filename}`,
    async () => {
      const arrayBuffer = await image.arrayBuffer()
      const url = await uploadToBucket(Buffer.from(arrayBuffer), filename)
      return url
    },
    `https://storage.mock.optimism.io/impersonation/${filename}`,
  )
}
