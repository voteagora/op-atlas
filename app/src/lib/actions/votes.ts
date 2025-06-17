"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"
import { createVoteAttestation } from "@/lib/eas"

export async function vote(
  data: any,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
) {
  return await createVoteAttestation(
    data,
    delegateAttestationSignature,
    signerAddress,
    citizenRefUID,
  )
}
