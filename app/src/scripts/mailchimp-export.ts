import { default as BaseMailchimp } from "@mailchimp/mailchimp_marketing"

import { prisma } from "@/db/client"
import mailchimp from "@/lib/mailchimp"

const BATCH_SIZE = 500
async function exportEmailsToMailchimp() {
  const userEmails = await prisma.userEmail.findMany({
    // Do we need this?
    // where: {
    //   verified: true,
    // },
    select: {
      email: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  const batchMembers = userEmails.map((userEmail) => {
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

  console.log(`Exporting ${batchMembers.length} emails to Mailchimp...`)

  try {
    for (let i = 0; i < batchMembers.length; i += BATCH_SIZE) {
      const batch = batchMembers.slice(i, i + BATCH_SIZE)

      await mailchimp.lists.batchListMembers("ae53f4c952", {
        members: batch,
      })
    }
  } catch (error) {
    console.error(error)
  }
}

exportEmailsToMailchimp()
