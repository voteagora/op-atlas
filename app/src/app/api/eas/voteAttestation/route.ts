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
    const { voteType } = body

    // Log the received data to see what's coming in
    console.log("Received vote request with data:", body)

    // Check if voteType is one of the valid vote types
    const validVoteTypes = ["For", "Abstain", "Against", "Veto"]
    if (!voteType || !validVoteTypes.includes(voteType)) {
      console.log("Invalid vote type:", voteType)
      console.log("Valid vote types:", validVoteTypes)
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const attestationId = await createVoteAttestation(voteType)

    return NextResponse.json({ attestationId })
  } catch (error) {
    console.error("Error creating vote attestation:", error)
    return NextResponse.json(
      { error: "Failed to create vote attestation" },
      { status: 500 },
    )
  }
}
