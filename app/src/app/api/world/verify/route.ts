"use server"

import {
  IVerifyResponse,
  verifyCloudProof,
} from "@worldcoin/idkit-core/backend"
import { NextResponse } from "next/server"

import { upsertUserWorldId } from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"
import { withImpersonationProtection } from "@/lib/impersonationContext"

export async function POST(request: Request) {
  const { db, userId } = await withImpersonation()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { proof } = await request.json()

    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID!
    const action = process.env.NEXT_PUBLIC_WORLD_APP_ACTION!

    const response = await withImpersonationProtection<IVerifyResponse>(
      "World ID",
      `Verify proof for user ${userId}`,
      async () =>
        (await verifyCloudProof(
          proof,
          app_id as `app_${string}`,
          action,
        )) as IVerifyResponse,
      {
        success: true,
        code: "mocked_impersonation",
        detail: "World ID verification skipped during impersonation",
        attribute: null,
      },
    )

    if (
      response.success === true ||
      response.code === "max_verifications_reached"
    ) {
      await upsertUserWorldId(
        {
          userId,
          nullifierHash: proof.nullifier_hash,
          verified: true,
        },
        db,
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify proof" },
      { status: 500 },
    )
  }
}
