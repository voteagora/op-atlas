"use server"

import { revalidatePath } from "next/cache"
import { getAddress } from "viem"

import { auth } from "@/auth"
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
  createCitizenAttestation,
  createCitizenWalletChangeAttestation,
  revokeCitizenAttestation,
} from "@/lib/eas/serverOnly"
import { clients } from "@/lib/eth"
import { Chain } from "@/lib/utils/contracts"
import { getSafeAddressVerificationMessage } from "@/lib/utils/safeAddresses"

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

export async function makeUserAddressPrimaryAction(address: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return
  }

  await makeUserAddressPrimary(address, userId)
  const citizen = await getCitizen({ type: CITIZEN_TYPES.user, id: userId })

  // If user is a citizen and with an active attestation, revoke it and create a new one
  if (citizen?.attestationId && citizen.address !== address) {
    const user = await getUserById(userId)
    await revokeCitizenAttestation(citizen.attestationId)

    const attestationId = await createCitizenAttestation({
      to: address,
      farcasterId: parseInt(user?.farcasterId || "0"),
      selectionMethod:
        CITIZEN_ATTESTATION_CODE[
          citizen.type as keyof typeof CITIZEN_ATTESTATION_CODE
        ],
      refUID: citizen.organizationId || citizen.projectId || undefined,
    })

    await createCitizenWalletChangeAttestation({
      oldCitizenUID: citizen.attestationId,
      newCitizenUID: attestationId,
    })

    await updateCitizen({
      id: userId,
      citizen: { attestationId, address },
    })
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
  const [session, safeInfo] = await Promise.all([
    auth(),
    fetchSafeInfoFromMainnet(formattedSafe),
  ])
  const userId = session?.user?.id
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
  const normalizedOwners = safeInfo.owners
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

  await addUserSafeAddress({ userId, safeAddress: formattedSafe })

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

  return { error: null, safeAddress: formattedSafe } as const
}

export async function removeSafeAddressAction(safeAddress: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" as const }
  }

  try {
    await removeUserSafeAddress({ userId, safeAddress })
  } catch (error) {
    console.error("Failed to remove Safe address", error)
    return { error: "Failed to remove Safe address" as const }
  }

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

  return { error: null } as const
}
