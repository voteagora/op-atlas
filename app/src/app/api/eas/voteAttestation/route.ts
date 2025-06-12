import { NextResponse } from "next/server"
import { createVoteAttestation } from "@/lib/eas"
import { VoteType } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { delegateAttestationSignature } = body

    // Log the received data to see what's coming in
    console.log("Received vote request with data:", body)

    const attestationId = await createVoteAttestation(
      delegateAttestationSignature,
    )

    return NextResponse.json({ attestationId })
  } catch (error) {
    console.error("Error creating vote attestation:", error)
    return NextResponse.json(
      { error: "Failed to create vote attestation" },
      { status: 500 },
    )
  }
}
