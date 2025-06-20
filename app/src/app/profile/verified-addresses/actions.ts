"use server"

import { auth } from "@/auth"
import { updateCitizen } from "@/db/citizens"
import { getUserById, makeUserAddressPrimary } from "@/db/users"
import { getCitizen } from "@/lib/actions/citizens"
import { CITIZEN_ATTESTATION_CODE, CITIZEN_TYPES } from "@/lib/constants"
import {
  createCitizenAttestation,
  createCitizenWalletChangeAttestation,
  revokeCitizenAttestation,
} from "@/lib/eas/serverOnly"

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
