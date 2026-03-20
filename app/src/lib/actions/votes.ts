"use server"

import { Signature } from "@ethereum-attestation-service/eas-sdk"

import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { createDelegatedVoteAttestationWithTx } from "@/lib/eas/serverOnly"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace"
import { MiradorTraceContext } from "@/lib/mirador/types"

export async function vote(
  data: string,
  delegateAttestationSignature: Signature,
  signerAddress: string,
  citizenRefUID: string,
  traceContext?: MiradorTraceContext,
) {
  await appendServerTraceEvent({
    traceContext: {
      ...traceContext,
      source: "backend",
      step: "vote_create_delegated_attestation_start",
    },
    eventName: "vote_server_attestation_started",
    details: {
      signerAddress,
      hasSignature: !!delegateAttestationSignature,
    },
    tags: ["governance", "vote", "server"],
  })

  try {
    console.info("[vote] createDelegatedVoteAttestation params:", {
      dataLength: data?.length,
      signerAddress,
      hasSignature: !!delegateAttestationSignature,
      citizenRefUID,
    })
    const { attestationId, txHash, chainId, txInputData } =
      await createDelegatedVoteAttestationWithTx(
        data,
        delegateAttestationSignature,
        signerAddress,
        citizenRefUID,
      )
    const miradorChain = getMiradorChainNameFromChainId(chainId)
    console.info("[vote] attested UID:", attestationId)

    await appendServerTraceEvent({
      traceContext: {
        ...traceContext,
        source: "backend",
        step: "vote_create_delegated_attestation_success",
      },
      eventName: "vote_server_attestation_succeeded",
      details: {
        signerAddress,
        uid: attestationId,
        txHash,
      },
      tags: ["governance", "vote", "server"],
      txHashHints:
        txHash && miradorChain
          ? [
              {
                txHash,
                chain: miradorChain,
                details: "Delegated governance vote attestation transaction",
              },
            ]
          : undefined,
      txInputData,
    })

    return attestationId
  } catch (error) {
    console.error("[vote] error:", error)
    const failedTxContext = extractFailedEasTxContext(error)
    const failedMiradorChain = getMiradorChainNameFromChainId(
      failedTxContext.chainId,
    )

    await appendServerTraceEvent({
      traceContext: {
        ...traceContext,
        source: "backend",
        step: "vote_create_delegated_attestation_failed",
      },
      eventName: "vote_server_attestation_failed",
      details: {
        signerAddress,
        error: error instanceof Error ? error.message : String(error),
      },
      tags: ["governance", "vote", "server", "error"],
      txHashHints:
        failedTxContext.txHash && failedMiradorChain
          ? [
              {
                txHash: failedTxContext.txHash,
                chain: failedMiradorChain,
                details: "Failed delegated governance vote attestation tx",
              },
            ]
          : undefined,
      txInputData: failedTxContext.txInputData,
    })

    throw error
  }
}
