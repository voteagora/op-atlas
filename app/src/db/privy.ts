"use server"

import { User } from "@prisma/client"
import { User as PrivyUser } from "@privy-io/react-auth"
import { getAddress } from "viem"

import { addContactToList, removeContactFromList } from "@/lib/api/mailchimp"

import { generateTemporaryUsername } from "@/lib/utils/username"
import {
  addUserAddresses,
  deleteUserEmails,
  getUserById,
  getUserByPrivyDid,
  removeUserAddress,
  updateUser,
  updateUserEmail,
} from "./users"

export const syncPrivyUser = async (
  privyUser: PrivyUser,
): Promise<User | null> => {
  const existingUser = await getUserByPrivyDid(privyUser.id)

  if (!existingUser) {
    console.error("User not found")
    return null
  }

  const addressesInDB =
    existingUser?.addresses?.map((addr) => getAddress(addr.address)) || []
  const addressesInPrivy =
    privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0
      ? (privyUser.linkedAccounts
        .filter(
          (account) =>
            account.type === "wallet" && account.chainType === "ethereum",
        )
        .map((wallet) =>
          (wallet as any).address
            ? getAddress((wallet as any).address as `0x${string}`)
            : null,
        )
        .filter(Boolean) as `0x${string}`[])
      : []

  // Link farcaster to user
  if (
    privyUser?.farcaster &&
    privyUser?.farcaster?.fid !== Number(existingUser.farcasterId)
  ) {
    await updateUser({
      id: existingUser.id,
      farcasterId: String(privyUser.farcaster.fid),
      privyDid: privyUser.id,
      name: privyUser.farcaster.displayName || null,
      username: privyUser.farcaster.username || null,
      imageUrl: privyUser.farcaster.pfp || null,
      bio: privyUser.farcaster.bio || null,
    })
  }

  // If farcaster was previously linked but now removed from privy, clear farcaster data
  if (!privyUser?.farcaster && existingUser.farcasterId) {
    try {
      await updateUser({
        id: existingUser.id,
        farcasterId: null,
        name: null,
        // Reset username to a temporary one
        username: generateTemporaryUsername(existingUser.privyDid!),
        imageUrl: null,
        bio: null,
      })
    } catch (error) {
      console.error("Failed to remove farcaster data:", error)
    }
  }

  // Remove addresses that exist in DB but not in Privy
  for (const addr of addressesInDB) {
    if (!addressesInPrivy.includes(addr)) {
      try {
        await removeUserAddress({
          id: existingUser.id,
          address: addr,
        })
      } catch (error) {
        console.error("Failed to remove wallet address:", error)
      }
    }
  }

  // Add addresses that exist in Privy but not in DB
  const addressesToAdd = addressesInPrivy.filter(
    (addr) => !addressesInDB.includes(addr),
  )
  if (addressesToAdd.length > 0) {
    try {
      await addUserAddresses({
        id: existingUser.id,
        addresses: addressesToAdd,
        source: "atlas",
      })
    } catch (error) {
      console.error("Failed to add linked wallet addresses:", error)
    }
  }

  const privyEmail = privyUser?.email
    ? privyUser?.email?.address?.toLowerCase()
    : null
  const dbEmail = existingUser?.emails[0]?.email
    ? existingUser.emails[0].email.toLowerCase()
    : null

  //  Add new or update existing email
  if (privyEmail && privyEmail !== dbEmail) {
    await updateUserEmail({
      id: existingUser.id,
      email: privyEmail,
      verified: true,
    })
    try {
      // TODO: Andrei - verify that emails are properly added to mailing list
      await addContactToList({ email: privyEmail })
    } catch (error) {
      console.error("Failed to update email:", error)
    }
  }

  // Remove existing email if it doesn't exist in Privy
  if (!privyEmail && dbEmail) {
    await deleteUserEmails(existingUser.id)
    try {
      // TODO: Andrei - verify that emails are properly removed from mailing list
      await removeContactFromList({ email: dbEmail })
    } catch (error) {
      console.error("Failed to remove contact from mailing list:", error)
    }
  }

  // Update Discord and Github
  await updateUser({
    id: existingUser.id,
    discord: privyUser?.discord?.username || null,
    github: privyUser?.github?.username || null,
  })

  return await getUserById(existingUser.id)
}



