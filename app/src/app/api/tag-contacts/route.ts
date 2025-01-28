import m from "@mailchimp/mailchimp_marketing"
import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import mailchimp from "@/lib/mailchimp"

export const dynamic = "force-dynamic"

type Entity = "badgeholder" | "citizen" | "gov_contribution" | "rf_voter"
type EntityObject = {
  address: string
  email: string
}
type EntityRecords = Record<Entity, EntityObject[]>

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID is not set")
  }

  const searchParams = request.nextUrl.searchParams

  const task = searchParams.get("task")
  if (task === "add") {
    console.log("Adding tags to Mailchimp contacts...")

    await addTagsToContacts()

    return new Response(`Mailchimp contacts tagged`, { status: 200 })
  }
  if (task === "remove") {
    console.log("Removing tags from Mailchimp contacts...")

    await removeTagsFromContacts()

    return new Response(`Mailchimp contacts untagged`, { status: 200 })
  }

  return new Response(`Task not found`, { status: 404 })
}

const addTagsToContacts = async () => {
  const records = await fetchRecords()

  await Promise.all([
    handleAddCitizenEntity({ citizen: records.citizen }),
    handleAddBadgeholderEntity({ badgeholder: records.badgeholder }),
    handleAddGovContributionEntity({
      gov_contribution: records.gov_contribution,
    }),
    handleAddRfVoterEntity({ rf_voter: records.rf_voter }),
  ])
}
const removeTagsFromContacts = async () => {
  const records = await fetchRecords()

  await Promise.all([
    handleRemoveCitizenEntity({ citizen: records.citizen }),
    handleRemoveBadgeholderEntity({ badgeholder: records.badgeholder }),
    handleRemoveGovContributionEntity({
      gov_contribution: records.gov_contribution,
    }),
    handleRemoveRfVoterEntity({ rf_voter: records.rf_voter }),
  ])
}

const fetchRecords = async (): Promise<EntityRecords> => {
  const EAS_INDEXER_API_URL = process.env.EAS_INDEXER_API_URL
  if (!EAS_INDEXER_API_URL) {
    throw new Error("EAS_INDEXER_API_URL is not set")
  }

  const records = await fetch(`${EAS_INDEXER_API_URL}/entities/aggregated`, {
    // NOTE: Do we need this? Not sure if our EAS Indexer is publiclly accessible as I see no authorisation anywhere
    // headers: {
    //   Authorization: `Bearer ${process.env.EAS_INDEXER_API_SECRET}`,
    // },
  })
    .then((res) => {
      const data = res.json()

      return data
    })
    .catch((error) => {
      console.error(error)
    })

  const [citizen, badgeholder, gov_contribution, rf_voter] = await Promise.all([
    prisma.userAddress.findMany({
      where: {
        address: {
          in: records.citizen,
        },
        // tag: {
        //   not: "citizen",
        // },
      },
      select: {
        address: true,
        user: {
          select: {
            emails: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.userAddress.findMany({
      where: {
        address: {
          in: records.badgeholder,
        },
        tag: {
          not: "badgeholder",
        },
      },
      select: {
        address: true,
        user: {
          select: {
            emails: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.userAddress.findMany({
      where: {
        address: {
          in: records.gov_contribution,
        },
        tag: {
          not: "gov_contribution",
        },
      },
      select: {
        address: true,
        user: {
          select: {
            emails: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.userAddress.findMany({
      where: {
        address: {
          in: records.rf_voter,
        },
        tag: {
          not: "rf_voter",
        },
      },
      select: {
        address: true,
        user: {
          select: {
            emails: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    }),
  ])

  const result = {
    citizen: citizen.map((c) => ({
      address: c.address,
      email: c.user.emails.at(-1)?.email ?? "",
    })),
    badgeholder: badgeholder.map((b) => ({
      address: b.address,
      email: b.user.emails.at(-1)?.email ?? "",
    })),
    gov_contribution: gov_contribution.map((g) => ({
      address: g.address,
      email: g.user.emails.at(-1)?.email ?? "",
    })),
    rf_voter: rf_voter.map((r) => ({
      address: r.address,
      email: r.user.emails.at(-1)?.email ?? "",
    })),
  }

  return result
}

const addTag = async (addresses: EntityObject[], tag: Entity) => {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const results = await mailchimp.lists.batchListMembers(LIST_ID!, {
    members: addresses.map((address) => ({
      email_address: address.email,
      tags: [tag],
      email_type: "html",
      status: "transactional",
    })),
    update_existing: true,
  })

  const updatedMembers = (results as any).updated_members.map(
    (member: any) => ({
      email: member.email_address,
      tag: member.tags.at(-1),
    }),
  )

  console.log(`Added tags to ${updatedMembers.length} Mailchimp contacts`)

  await prisma.userAddress.updateMany({
    where: {
      address: {
        in: addresses.map((address) => address.address),
      },
    },
    data: {
      tag: {
        set: tag,
      },
    },
  })

  console.log(`Updated ${updatedMembers.length} user addresses`)
}

const removeTag = async (addresses: EntityObject[], tag: Entity) => {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const results = await mailchimp.lists.batchListMembers(LIST_ID!, {
    members: addresses.map((address) => ({
      email_address: address.email,
      tags: [],
      email_type: "html",
      status: "transactional",
    })),
    update_existing: true,
  })

  const updatedMembers = (results as any).updated_members.map(
    (member: any) => member.email_address,
  )

  console.log(`Removed tags from ${updatedMembers.length} Mailchimp contacts`)

  await prisma.userAddress.updateMany({
    where: {
      address: {
        in: addresses.map((address) => address.address),
      },
    },
    data: {
      tag: {
        set: null,
      },
    },
  })

  console.log(`Updated ${updatedMembers.length} user addresses`)
}

const handleAddCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  await addTag(records.citizen, "citizen")
}
const handleAddBadgeholderEntity = async (
  records: Record<"badgeholder", EntityObject[]>,
) => {}
const handleAddGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {}
const handleAddRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {}

const handleRemoveCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  await removeTag(records.citizen, "citizen")
}
const handleRemoveBadgeholderEntity = async (
  records: Record<"badgeholder", EntityObject[]>,
) => {}
const handleRemoveGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {}
const handleRemoveRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {}
