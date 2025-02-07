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

export async function getContact(email: string) {
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

export async function getContactTags(email: string) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  try {
    return await mailchimp.lists.getListMemberTags(LIST_ID, Md5.hashStr(email))
  } catch (error: any) {
    if (error.status === 404) {
      return null
    }

    throw new Error("Error getting contact", error)
  }
}
