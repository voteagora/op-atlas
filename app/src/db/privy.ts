"use server"

import { User } from "@prisma/client"
import { User as PrivyUser } from "@privy-io/react-auth"
import { getAddress } from "viem"

import { revalidatePath } from "next/cache"

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
  updateUserFarcasterId,
} from "./users"

import { linkOrphanedKYCUserToUser } from "./userKyc"

export const syncPrivyUser = async (
  privyUser: PrivyUser,
): Promise<User | null> => {
  const existingUser = await getUserByPrivyDid(privyUser.id)

  if (!existingUser) {
    console.error(
      `[Auth] No existing user found for Privy DID ${privyUser.id}`,
    )
    return null
  }

  const addressesInDB: `0x${string}`[] =
    (existingUser?.addresses?.map((addr) =>
      getAddress(addr.address as `0x${string}`),
    ) as `0x${string}`[]) || []
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
    try {
      await updateUserFarcasterId({
        userId: existingUser.id,
        farcasterId: String(privyUser.farcaster.fid),
        name: privyUser.farcaster.displayName || null,
        username: privyUser.farcaster.username || null,
        imageUrl: privyUser.farcaster.pfp || null,
        bio: privyUser.farcaster.bio || null,
      })
    } catch (error) {
      console.error(
        `[Auth] Failed to link Farcaster account (FID: ${privyUser.farcaster.fid}) to user ${existingUser.id}:`,
        error,
      )
      // Don't throw - allow login to continue even if Farcaster link fails
    }
  }

  // If farcaster was previously linked but now removed from privy, clear farcaster data
  if (!privyUser?.farcaster && existingUser.farcasterId) {
    try {
      await updateUserFarcasterId({
        userId: existingUser.id,
        farcasterId: null,
        name: null,
        username: generateTemporaryUsername(existingUser.privyDid!),
        imageUrl: null,
        bio: null,
      })
    } catch (error) {
      console.error(
        `[Auth] Failed to clear farcasterId from user ${existingUser.id}:`,
        error,
      )
    }
  }

  // Remove addresses that exist in DB but not in Privy
  for (const addr of addressesInDB) {
    if (!addressesInPrivy.includes(addr as `0x${string}`)) {
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
    try {
      await updateUserEmail({
        id: existingUser.id,
        email: privyEmail,
        verified: true,
      })
      const linkResult = await linkOrphanedKYCUserToUser(existingUser.id, privyEmail)
      if (linkResult.linked) {
        revalidatePath("/dashboard")
        revalidatePath("/profile/details")
      }
      try {
        // TODO: Andrei - verify that emails are properly added to mailing list
        await addContactToList({ email: privyEmail })
      } catch (error) {
        console.error("Failed to update email:", error)
      }
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

  // Update Discord, Github, and Twitter
  try {
    await updateUser({
      id: existingUser.id,
      discord: privyUser?.discord?.username || null,
      github: privyUser?.github?.username || null,
      twitter: privyUser?.twitter?.username || null,
    })
  } catch (error) {
    console.error(
      `[Auth] Failed to update social accounts for user ${existingUser.id}:`,
      error,
    )
  }

  return await getUserById(existingUser.id)
}
