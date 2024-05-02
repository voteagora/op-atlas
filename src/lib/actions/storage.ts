/**
 * Interface for uploading and manipulating images
 */

"use server"

import { uploadToBucket } from "../google"

export const uploadImage = async (image: Blob): Promise<string> => {
  const arrayBuffer = await image.arrayBuffer()
  const filename = `${crypto.randomUUID()}.png`
  const url = await uploadToBucket(Buffer.from(arrayBuffer), filename)

  return url
}
