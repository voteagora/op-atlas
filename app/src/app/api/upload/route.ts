import { uploadImage } from "@/lib/actions/storage"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export async function POST(request: Request) {
  // Don't want this to be public
  const { userId } = await getImpersonationContext()
  if (!userId) {
    return Response.error()
  }

  const image = await request.blob()
  const url = await uploadImage(image)

  return Response.json({ url })
}
