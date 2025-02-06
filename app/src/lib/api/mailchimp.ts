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
