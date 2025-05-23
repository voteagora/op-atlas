import { auth } from "@/auth"
// import { IVerifyResponse, verifyCloudProof } from "@worldcoin/idkit"
import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { proof, action } = await request.json()

    // TODO: Verify that the ation is valid
    // const action = process.env.NEXT_PUBLIC_WORLD_APP_ACTION;
    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID
    const api_key = process.env.WORLD_APP_API_KEY

    if (!app_id || !api_key) {
      return NextResponse.json(
        { error: "World ID configuration missing" },
        { status: 500 },
      )
    }

    // const verifyRes = await verifyCloudProof(
    //   proof,
    //   app_id as `app_${string}`,
    //   action,
    // ) as IVerifyResponse

    // if (verifyRes.success) {
    //   return NextResponse.json({ success: true, message: "Proof verified" })
    // } else {
    //   // TODO: Handle errors from the World ID /verify endpoint.
    //   return NextResponse.json(
    //     { success: false, message: "Proof not verified" },
    //     { status: 400 }
    //   )
    // }
  } catch (error) {
    console.error("Error verifying World ID proof:", error)
    return NextResponse.json(
      { success: false, error: "Failed to verify proof" },
      { status: 500 },
    )
  }
}
