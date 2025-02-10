import { default as BaseMailchimp } from "@mailchimp/mailchimp_marketing"

import { prisma } from "@/db/client"
import mailchimp from "@/lib/mailchimp"

const BATCH_SIZE = 500
type SUBSCRIBED_MEMBER = {
  subscriber_hash: string
  email_address: string
}

const LIST_ID = process.env.MAILCHIMP_LIST_ID

async function exportEmailsToMailchimp() {
  const userEmails = await prisma.userEmail.findMany({
    // Do we need this?
    // where: {
    //   verified: true,
    // },
    select: {
      id: true,
      email: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  const batchMembers = userEmails
    .map((userEmail) => {
      const userFullName = userEmail.user.name
      const [FNAME, LNAME] = userFullName ? userFullName.split(" ") : ["", ""]

      const data: BaseMailchimp.lists.BatchListMembersBodyMembersObject = {
        email_address: userEmail.email,
        email_type: "html",
        status: "subscribed",
        merge_fields: {
          EMAIL: userEmail.email,
          FNAME,
          LNAME,
        },
      }

      return data
    })
    .filter(
      (member, index, self) =>
        index ===
        self.findIndex((t) => t.email_address === member.email_address),
    )

  // We should consider this being dynamic via DB
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID is not defined")
  }

  console.log(`Exporting ${batchMembers.length} emails to Mailchimp...`)

  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID is not set")
  }

  try {
    for (let i = 0; i < batchMembers.length; i += BATCH_SIZE) {
      const batch = batchMembers.slice(i, i + BATCH_SIZE)

      const res = await mailchimp.lists.batchListMembers(LIST_ID, {
        members: batch,
      })

      const newMembers = (res as any).new_members
      newMembers.forEach((member: SUBSCRIBED_MEMBER) => {
        console.log(`Added ${member.email_address} to Mailchimp`)
      })
    }
  } catch (error) {
    console.error(error)
  }
}

exportEmailsToMailchimp()
