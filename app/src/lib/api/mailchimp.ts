import "server-only"

import { Md5 } from "ts-md5"

import mailchimp from "@/lib/mailchimp"

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

  try {
    if (users.length > 0) {
      const results = (await mailchimp.lists.batchListMembers(LIST_ID, {
        members: users.map((user) => ({
          email_address: user.email,
          tags: user.tags,
          email_type: "html",
          status: "transactional",
        })),
        update_existing: true,
        sync_tags: true,
      })) as any

      console.log(
        `[+] Mailchimp contacts tagged: ${results.updated_members.length}`,
      )

      results.updated_members.forEach((member: any) => {
        console.log(
          `  - ${member.email_address}; tags: ${
            users.find((u) => u.email === member.email_address)?.tags
          };`,
        )
      })
    }

    return { success: true }
  } catch (error) {
    console.error(`[-] Mailchimp contacts tagging failed: ${error}`)
    return { success: false, error }
  }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `email` (string): The user's email address.
 */
export async function addContactToList(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const email = data.get("email") as string

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
export async function removeContactFromList(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const email = data.get("email") as string

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
export async function updateContactEmail(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const currentEmail = data.get("currentEmail") as string
  const newEmail = data.get("newEmail") as string

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
