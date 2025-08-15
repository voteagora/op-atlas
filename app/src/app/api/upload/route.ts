import { auth } from "@/auth"
import { uploadImage } from "@/lib/actions/storage"

export const runtime = process.env.NEXT_PUBLIC_E2E === "true" ? "nodejs" : "edge"

export async function POST(request: Request) {
  // Don't want this to be public
  const session = await auth()
  if (!session?.user) {
    return Response.error()
  }

  const image = await request.blob()
  const url = await uploadImage(image)

  return Response.json({ url })
}
