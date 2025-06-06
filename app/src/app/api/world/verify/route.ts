"use server"

import {
  IVerifyResponse,
  verifyCloudProof,
} from "@worldcoin/idkit-core/backend"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { upsertUserWorldId } from "@/db/users"

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { proof } = await request.json()

    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID!
    const action = process.env.NEXT_PUBLIC_WORLD_APP_ACTION!

    const response = (await verifyCloudProof(
      proof,
      app_id as `app_${string}`,
      action,
    )) as IVerifyResponse

    if (
      response.success === true ||
      response.code === "max_verifications_reached"
    ) {
      await upsertUserWorldId({
        userId,
        nullifierHash: proof.nullifier_hash,
        verified: true,
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify proof" },
      { status: 500 },
    )
  }
}
