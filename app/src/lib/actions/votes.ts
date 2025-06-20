"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"
import { createDelegatedVoteAttestation } from "@/lib/eas/serverOnly"

export async function vote(
  data: any,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
) {
  return await createDelegatedVoteAttestation(
    data,
    delegateAttestationSignature,
    signerAddress,
    citizenRefUID,
  )
}
