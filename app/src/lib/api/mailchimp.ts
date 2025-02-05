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
    const usersWithTags = users.filter((u) => u.tags.length > 0)
    const usersWithoutTags = users.filter((u) => u.tags.length === 0)

    // Update users with tags
    if (usersWithTags.length > 0) {
      const results = (await mailchimp.lists.batchListMembers(LIST_ID, {
        members: usersWithTags.map((user) => ({
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

    // Remove users without tags from Mailchimp
    if (usersWithoutTags.length > 0) {
      console.log(
        `[-] Removing ${usersWithoutTags.length} contacts from Mailchimp list`,
      )
      await Promise.all(
        usersWithoutTags.map((user) =>
          mailchimp.lists
            .deleteListMember(LIST_ID, user.email)
            .catch((err: any) => {
              console.error(
                `[-] Failed to remove ${user.email} from Mailchimp: ${err}`,
              )
            }),
        ),
      )
    }

    return { success: true }
  } catch (error) {
    console.error(`[-] Mailchimp contacts tagging failed: ${error}`)
    return { success: false, error }
  }
}
