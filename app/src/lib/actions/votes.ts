"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"

import { createDelegatedVoteAttestation } from "@/lib/eas/serverOnly"

export async function vote(
  data: string,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
) {
  try {
    console.info("[vote] createDelegatedVoteAttestation params:", {
      dataLength: data?.length,
      signerAddress,
      hasSignature: !!delegateAttestationSignature,
      citizenRefUID,
    })
    const uid = await createDelegatedVoteAttestation(
      data,
      delegateAttestationSignature,
      signerAddress,
      citizenRefUID,
    )
    console.info("[vote] attested UID:", uid)
    return uid
  } catch (error) {
    console.error("[vote] error:", error)
    throw error
  }
}
