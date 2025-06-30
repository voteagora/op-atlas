"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"

import {
  createDelegatedVoteAttestation,
  createDirectVoteAttestation,
} from "@/lib/eas/serverOnly"

export async function vote(
  data: string,
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

/**
 * Creates a direct vote attestation for Safe wallets (no delegation)
 * @param data - Encoded vote data
 * @param signerAddress - Address of the voter
 * @param citizenRefUID - Citizen attestation UID to reference
 * @returns Promise<string> - Attestation ID
 */
export async function voteDirectly(
  data: string,
  signerAddress: string,
  citizenRefUID: string,
) {
  return await createDirectVoteAttestation(data, signerAddress, citizenRefUID)
}
