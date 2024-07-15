import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")

  if (!url) {
    return new Response("Invalid URL", { status: 400 })
  }

  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const imageData = Buffer.from(arrayBuffer).toString("base64")
    return NextResponse.json({ imageData })
  } catch (error) {
    return new Response("Failed to fetch image", { status: 500 })
  }
}
