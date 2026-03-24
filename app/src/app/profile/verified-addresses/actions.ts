"use server"

import { revalidatePath } from "next/cache"
import { getAddress } from "viem"

import { updateCitizen } from "@/db/citizens"
import {
  addUserSafeAddress,
  getUserById,
  makeUserAddressPrimary,
  removeUserSafeAddress,
} from "@/db/users"
import { getCitizen } from "@/lib/actions/citizens"
import { CITIZEN_ATTESTATION_CODE, CITIZEN_TYPES } from "@/lib/constants"
import { SAFE_OPMAINET_TRANSACTION_URL } from "@/lib/constants"
import {
  createCitizenAttestationWithTx,
  createCitizenWalletChangeAttestationWithTx,
  revokeCitizenAttestationWithTx,
} from "@/lib/eas/serverOnly"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { clients } from "@/lib/eth"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"
import { Chain } from "@/lib/utils/contracts"
import { getSafeAddressVerificationMessage } from "@/lib/utils/safeAddresses"
import { getImpersonationContext } from "@/lib/db/sessionContext"
import {
  appendServerTraceEvent,
  closeMiradorServerTrace,
  startMiradorServerTrace,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace"
import { MiradorTraceContext } from "@/lib/mirador/types"

import { AddressData } from "./content"

async function fetchSafeInfoFromMainnet(safeAddress: `0x${string}`) {
  try {
    const endpoint = `${SAFE_OPMAINET_TRANSACTION_URL}/v1/safes/${safeAddress}`
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        ...(process.env.NEXT_PUBLIC_SAFE_API_KEY && {
          "x-api-key": process.env.NEXT_PUBLIC_SAFE_API_KEY,
        }),
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch Safe info", response.status)
      return null
    }

    const data = (await response.json()) as {
      owners?: string[]
    }

    return data
  } catch (error) {
    console.error("Failed to fetch Safe info", error)
    return null
  }
}

export async function makeUserAddressPrimaryAction(
  address: string,
  traceContext?: MiradorTraceContext,
) {
  const { session, db, userId } = await getImpersonationContext()

  if (!userId) {
    return
  }

  await makeUserAddressPrimary(address, userId, db, session)
  const citizen = await getCitizen({ type: CITIZEN_TYPES.user, id: userId })

  // If user is a citizen and with an active attestation, revoke it and create a new one
  if (citizen?.attestationId && citizen.address !== address) {
    const standaloneTrace = traceContext
      ? null
      : startMiradorServerTrace({
          name: "PrimaryAddressChange",
          flow: MIRADOR_FLOW.citizenPrimaryAddressChange,
          context: {
            userId,
            walletAddress: address,
            sessionId: userId,
          },
          tags: ["citizen", "address_change", "backend"],
        })
    const serverTraceContext: MiradorTraceContext = traceContext ?? {
      flow: MIRADOR_FLOW.citizenPrimaryAddressChange,
      source: "backend",
      userId,
      walletAddress: address,
      sessionId: userId,
    }

    await appendServerTraceEvent({
      trace: standaloneTrace,
      traceContext: withMiradorTraceStep(
        serverTraceContext,
        "primary_address_change_reattest_start",
        "backend",
      ),
      eventName: "primary_address_change_reattest_started",
      details: {
        userId,
        oldAddress: citizen.address,
        newAddress: address,
        oldAttestationId: citizen.attestationId,
      },
      tags: ["citizen", "address_change", "reattest"],
    })

    try {
      const user = await getUserById(userId, db, session)
      const txHashHints: Array<{
        txHash: string
        chain: NonNullable<ReturnType<typeof getMiradorChainNameFromChainId>>
        details: string
      }> = []

      const revocationResult = await revokeCitizenAttestationWithTx(
        citizen.attestationId,
      )
      const revocationMiradorChain = getMiradorChainNameFromChainId(
        revocationResult.chainId,
      )
      if (revocationResult.txHash && revocationMiradorChain) {
        txHashHints.push({
          txHash: revocationResult.txHash,
          chain: revocationMiradorChain,
          details: "Citizen revocation for primary address change",
        })
      }

      const newCitizenAttestation = await createCitizenAttestationWithTx({
        to: address,
        farcasterId: parseInt(user?.farcasterId || "0"),
        selectionMethod:
          CITIZEN_ATTESTATION_CODE[
            citizen.type as keyof typeof CITIZEN_ATTESTATION_CODE
          ],
        refUID: citizen.organizationId || citizen.projectId || undefined,
      })
      const newCitizenMiradorChain = getMiradorChainNameFromChainId(
        newCitizenAttestation.chainId,
      )
      if (newCitizenAttestation.txHash && newCitizenMiradorChain) {
        txHashHints.push({
          txHash: newCitizenAttestation.txHash,
          chain: newCitizenMiradorChain,
          details: "Citizen re-attestation for primary address change",
        })
      }

      const walletChangeAttestation =
        await createCitizenWalletChangeAttestationWithTx({
          oldCitizenUID: citizen.attestationId,
          newCitizenUID: newCitizenAttestation.attestationId,
        })
      const walletChangeMiradorChain = getMiradorChainNameFromChainId(
        walletChangeAttestation.chainId,
      )
      if (walletChangeAttestation.txHash && walletChangeMiradorChain) {
        txHashHints.push({
          txHash: walletChangeAttestation.txHash,
          chain: walletChangeMiradorChain,
          details: "Citizen wallet change link attestation",
        })
      }

      await updateCitizen(
        {
          id: userId,
          citizen: {
            attestationId: newCitizenAttestation.attestationId,
            address,
          },
        },
        db,
      )

      await appendServerTraceEvent({
        trace: standaloneTrace,
        traceContext: withMiradorTraceStep(
          serverTraceContext,
          "primary_address_change_reattest_success",
          "backend",
        ),
        eventName: "primary_address_change_reattest_succeeded",
        details: {
          userId,
          newAddress: address,
          oldAttestationId: citizen.attestationId,
          newAttestationId: newCitizenAttestation.attestationId,
        },
        tags: ["citizen", "address_change", "reattest"],
        txHashHints: txHashHints.length > 0 ? txHashHints : undefined,
        txInputData:
          newCitizenAttestation.txInputData ??
          walletChangeAttestation.txInputData ??
          revocationResult.txInputData,
      })
      await closeMiradorServerTrace(
        standaloneTrace,
        "Primary address change succeeded",
      )
    } catch (error) {
      const failedTxContext = extractFailedEasTxContext(error)
      const failedMiradorChain = getMiradorChainNameFromChainId(
        failedTxContext.chainId,
      )

      await appendServerTraceEvent({
        trace: standaloneTrace,
        traceContext: withMiradorTraceStep(
          serverTraceContext,
          "primary_address_change_reattest_exception",
          "backend",
        ),
        eventName: "primary_address_change_reattest_failed",
        details: {
          userId,
          oldAttestationId: citizen.attestationId,
          error: error instanceof Error ? error.message : String(error),
        },
        tags: ["citizen", "address_change", "reattest", "error"],
        txHashHints:
          failedTxContext.txHash && failedMiradorChain
            ? [
                {
                  txHash: failedTxContext.txHash,
                  chain: failedMiradorChain,
                  details: "Failed primary address change transaction",
                },
              ]
            : undefined,
        txInputData: failedTxContext.txInputData,
      })
      await closeMiradorServerTrace(
        standaloneTrace,
        "Primary address change failed",
      )

      throw error
    }
  }
}

export async function verifySafeAddressAction({
  safeAddress,
  signature,
  allAddresses,
}: {
  safeAddress: string
  signature: string
  allAddresses: AddressData[]
}) {
  let formattedSafe: `0x${string}`
  try {
    formattedSafe = getAddress(safeAddress) as `0x${string}`
  } catch (_) {
    return { error: "Invalid Safe address" as const }
  }
  const [{ db, userId }, safeInfo] = await Promise.all([
    getImpersonationContext(),
    fetchSafeInfoFromMainnet(formattedSafe),
  ])
  if (!userId) {
    return { error: "Unauthorized" as const }
  }

  if (!signature || !signature.startsWith("0x")) {
    return { error: "Signature is required" as const }
  }

  if (!safeInfo) {
    return {
      error:
        "Unable to verify Safe ownership. Please try again later." as const,
    }
  }

  // Normalize all user addresses for comparison
  const userAddresses = new Set(
    allAddresses.map((addr) => getAddress(addr.address)),
  )

  // Normalize Safe owners for comparison
  const normalizedOwners =
    safeInfo.owners
      ?.map((owner) => {
        try {
          return getAddress(owner)
        } catch (_) {
          return null
        }
      })
      .filter((owner): owner is `0x${string}` => Boolean(owner)) || []

  // Check if any of the Safe owners match any of the user's verified addresses
  const matchingAddresses = normalizedOwners.filter((owner) =>
    userAddresses.has(owner),
  )

  if (matchingAddresses.length === 0) {
    return {
      error: "None of your verified addresses are owners of this Safe" as const,
    }
  }

  try {
    const client = clients[Chain.Optimism]
    const isValidSignature = await client.verifyMessage({
      address: safeAddress,
      message: getSafeAddressVerificationMessage(formattedSafe),
      signature: signature as `0x${string}`,
    })

    if (!isValidSignature) {
      return { error: "Invalid signature" as const }
    }
  } catch (e) {
    console.error("Failed to verify signature:", e)
    return { error: "Invalid signature" as const }
  }

  await addUserSafeAddress({ userId, safeAddress: formattedSafe }, db)

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

  return { error: null, safeAddress: formattedSafe } as const
}

export async function removeSafeAddressAction(safeAddress: string) {
  const { db, userId } = await getImpersonationContext()

  if (!userId) {
    return { error: "Unauthorized" as const }
  }

  try {
    await removeUserSafeAddress({ userId, safeAddress }, db)
  } catch (error) {
    console.error("Failed to remove Safe address", error)
    return { error: "Failed to remove Safe address" as const }
  }

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

  return { error: null } as const
}
