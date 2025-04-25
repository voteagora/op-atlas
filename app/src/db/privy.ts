"use server"

import { addContactToList, removeContactFromList } from "@/lib/api/mailchimp"
import { User } from "@prisma/client"
import { User as PrivyUser } from "@privy-io/react-auth"
import { getAddress } from "viem"
import { addUserAddresses, deleteUserEmails, getUserById, getUserByPrivyDid, removeUserAddress, updateUser, updateUserEmail } from "./users"

export const syncPrivyUser = async (
    privyUser: PrivyUser,
): Promise<User | null> => {


    const existingUser = await getUserByPrivyDid(privyUser.id)

    if (!existingUser) {
        console.error("User not found")
        return null
    }

    const addressesInDB = existingUser?.addresses?.map((addr) => getAddress(addr.address)) || []
    const addressesInPrivy = privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0
        ? privyUser.linkedAccounts
            .filter(account => account.type === "wallet" && account.chainType === "ethereum")
            .map(wallet => (wallet as any).address ? getAddress((wallet as any).address as `0x${string}`) : null)
            .filter(Boolean) as `0x${string}`[]
        : [];


    if (privyUser?.farcaster && privyUser.farcaster.fid && privyUser.farcaster.fid.toString() !== existingUser.farcasterId) {

        // Link farcaster to user
        await updateUser({
            id: existingUser.id,
            farcasterId: privyUser.farcaster.fid.toString(),
            privyDid: privyUser.id,
            name: privyUser.farcaster.displayName || null,
            username: privyUser.farcaster.username || null,
            imageUrl: privyUser.farcaster.pfp || null,
            bio: privyUser.farcaster.bio || null,
        })

    } else {
        // If farcaster was previously linked but now removed, clear farcaster data
        if (existingUser.farcasterId) {
            try {
                await updateUser({
                    id: existingUser.id,
                    farcasterId: null,
                })
            } catch (error) {
                console.error("Failed to remove farcaster data:", error)
            }
        }
    }

    // Remove addresses that exist in DB but not in Privy
    for (const addr of addressesInDB) {
        if (!addressesInPrivy.includes(addr)) {
            try {
                await removeUserAddress({
                    id: existingUser.id,
                    address: addr,
                });
            } catch (error) {
                console.error("Failed to remove wallet address:", error);
            }
        }
    }

    // Add addresses that exist in Privy but not in DB
    const addressesToAdd = addressesInPrivy.filter(addr => !addressesInDB.includes(addr));
    if (addressesToAdd.length > 0) {
        try {
            await addUserAddresses({
                id: existingUser.id,
                addresses: addressesToAdd,
                source: "privy",
            });
        } catch (error) {
            console.error("Failed to add linked wallet addresses:", error);
        }
    }

    // Update email
    if (privyUser?.email && privyUser.email.address) {

        if (existingUser.emails.length > 0 && privyUser.email.address.toLowerCase() !== existingUser.emails[0].email.toLowerCase()) {
            try {
                await updateUserEmail({
                    id: existingUser.id,
                    email: privyUser.email.address.toLowerCase(),
                    verified: true,
                })

                await addContactToList({ email: privyUser.email.address.toLowerCase() })

            } catch (error) {
                console.error("Failed to update email:", error)
            }
        }
    } else {

        // Check if user has an email record before attempting to remove from list
        if (existingUser?.emails.length > 0) {
            try {
                await removeContactFromList({ email: existingUser.emails[0].email });
            } catch (error) {
                console.error("Failed to remove contact from mailing list:", error);
            }
        }

        deleteUserEmails(existingUser.id)
    }

    // Update Discord and Github
    await updateUser({
        id: existingUser.id,
        discord: privyUser?.discord?.username || null,
        github: privyUser?.github?.username || null,
    })

    return await getUserById(existingUser.id)
}