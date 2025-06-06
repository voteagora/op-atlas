import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { createCitizenAttestation, revokeCitizenAttestation } from "@/lib/eas"

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id

  try {
    const { address, selectionMethod, farcasterId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      )
    }

    if (!selectionMethod) {
      return NextResponse.json(
        { error: "Selection method is required" },
        { status: 400 },
      )
    }

    if (!farcasterId) {
      return NextResponse.json(
        { error: "Farcaster ID is required" },
        { status: 400 },
      )
    }

    // Create attestation
    const attestationId = await createCitizenAttestation({
      to: address,
      farcasterId: parseInt(farcasterId),
      selectionMethod,
    })

    return NextResponse.json({ attestationId })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to attest citizen" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { attestationId } = await request.json()

    if (!attestationId) {
      return NextResponse.json(
        { error: "Attestation ID is required" },
        { status: 400 },
      )
    }

    await revokeCitizenAttestation(attestationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revoke citizen attestation" },
      { status: 500 },
    )
  }
}
