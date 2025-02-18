import "server-only"

import { Md5 } from "ts-md5"

import mailchimp from "@/lib/mailchimp"
import { arrayDifference } from "@/lib/utils"

export async function updateMailchimpTags(
  users: {
    id?: string
    email: string
    tags: string[]
  }[],
) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const API_KEY = process.env.MAILCHIMP_API_KEY

  if (!LIST_ID || !API_KEY) {
    console.error("[-] Mailchimp API credentials missing")
    return { success: false, error: "Missing Mailchimp credentials" }
  }

  if (users.length > 0) {
    const existingTagsMap = new Map<string, string[]>()
    const existingTags = (await mailchimp.lists.getListMembersInfo(LIST_ID, {
      fields: ["members.email_address", "members.tags"],
      count: 9999, // There is no way to specify which emails to get the info for so we can't batch. We have to get all of them at once
    })) as any
    existingTags.members.forEach((member: any) => {
      existingTagsMap.set(member.email_address, member.tags) // Pushing to Map so retrival is O(1) instead of O(n)
    })

    const BATCH_SIZE = 500
    let totalUpdated = 0

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE)
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          users.length / BATCH_SIZE,
        )} (${batch.length} users)`,
      )

      const usersTagsDifference = new Map(
        batch.map((user) => [
          user.email,
          arrayDifference(
            existingTagsMap.get(user.email)?.map((tag: any) => tag.name) || [],
            user.tags,
          ),
        ]),
      )

      const results = (await mailchimp.lists.batchListMembers(LIST_ID, {
        members: batch.map((user) => ({
          email_address: user.email,
          tags: [...user.tags, ...(usersTagsDifference.get(user.email) ?? [])],
          email_type: "html",
          status: "subscribed",
        })),
        update_existing: true,
        sync_tags: true,
      })) as any

      totalUpdated += results.updated_members.length

      results.updated_members.forEach((member: any) => {
        console.log(
          `  - ${member.id}; tags: ${
            batch.find((u) => u.email === member.email_address)?.tags
          };`,
        )
      })
    }

    console.log(`[+] Total Mailchimp contacts tagged: ${totalUpdated}`)
  }

  return { success: true }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `email` (string): The user's email address.
 */
export async function addContactToList({ email }: { email: string }) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const contact = await getContact(email)
  if (contact) {
    return
  }

  try {
    await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: "subscribed",
    })
  } catch (error: any) {
    console.log("Error adding contact email", error)
  }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `email` (string): The user's email address.
 */
export async function removeContactFromList({ email }: { email: string }) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  try {
    await mailchimp.lists.deleteListMember(LIST_ID, email)
  } catch (error: any) {
    console.log("Error removing contact email", error)
  }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `currentEmail` (string): The user's current email address.
 *   - `newEmail` (string): The user's new email address.
 */
export async function updateContactEmail({
  currentEmail,
  newEmail,
}: {
  currentEmail: string
  newEmail: string
}) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  try {
    const subscriberHash = Md5.hashStr(currentEmail)

    await mailchimp.lists.updateListMember(LIST_ID, subscriberHash, {
      email_address: newEmail,
      status: "subscribed",
    })
  } catch (error: any) {
    console.log("Error updating contact email", error)
  }
}

async function getContact(email: string) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  try {
    return await mailchimp.lists.getListMember(LIST_ID, Md5.hashStr(email))
  } catch (error: any) {
    if (error.status === 404) {
      return null
    }

    throw new Error("Error getting contact", error)
  }
}
