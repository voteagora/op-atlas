import mailchimp from "@/lib/mailchimp"

export async function updateMailchimpTags(
  users: {
    id?: string
    email: string
    tags: string[]
  }[],
) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    console.error("[-] MAILCHIMP_LIST_ID not set")
    return
  }

  const results = (await mailchimp.lists
    .batchListMembers(LIST_ID!, {
      members: users.map((user) => ({
        email_address: user.email,
        tags: user.tags ?? [],
        email_type: "html",
        status: "transactional",
      })),
      update_existing: true,
      sync_tags: true,
    })
    .catch((error: any) => {
      console.error(`[-] Mailchimp contacts tagging failed: ${error}`)
    })) as any

  console.log(
    `[+] Mailchimp contacts tagged: ${results.updated_members.length}`,
  )

  results.updated_members.forEach((member: any) => {
    console.log(
      `  - ${member.email_address}; tags: ${
        users.find((u) => {
          return u.email === member.email_address
        })?.tags
      };`,
    )
  })

  return results
}
