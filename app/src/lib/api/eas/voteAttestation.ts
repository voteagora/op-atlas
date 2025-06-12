import { VoteType } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"

export async function createVoteAttestationCall(
  delegateAttestationSignature: string,
): Promise<any> {
  console.log(
    `Making API request to /api/eas/voteAttestation with signature: ${delegateAttestationSignature}`,
  )

  try {
    const response = await fetch("/api/eas/voteAttestation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ delegateAttestationSignature }),
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error response text: ${errorText}`)

      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || "Failed to create vote attestation")
      } catch (parseError) {
        throw new Error(`Failed to create vote attestation: ${errorText}`)
      }
    }

    const responseText = await response.text()
    console.log(`Response text: ${responseText}`)

    if (!responseText) {
      return { attestationId: "empty-response" }
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.error("Error in createVoteAttestationCall:", error)
    throw error
  }
}
