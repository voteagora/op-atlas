"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"
import { createDelegatedVoteAttestation } from "@/lib/eas/serverOnly"
import { OffchainVote } from "@/components/proposals/proposal.types"
import { Citizen, citizenCategory } from "@prisma/client"
import { postOffchainVote } from "@/db/votes"

export async function vote(
  data: string,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
  choices: string[],
  proposalId: string,
  citizen: Citizen,
) {
  const attestationId = await createDelegatedVoteAttestation(
    data,
    delegateAttestationSignature,
    signerAddress,
    citizenRefUID,
  )

  // build an offchain vote object for the DB
  const offchainVote: OffchainVote = {
    attestationId: attestationId,
    voterAddress: signerAddress,
    proposalId: proposalId,
    vote: choices,
    citizenId: citizen.id,
    citizenType: citizen.type as citizenCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // 3. Record vote in the database
  await postOffchainVote(offchainVote)
}
