import { Prisma } from "@prisma/client"
import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import { getAggregatedRecords } from "@/db/users"
import { getAggregatedData } from "@/lib/api/eas/aggregated"
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

  const records = await getAggregatedData()
  const result = await getAggregatedRecords(records)

  return result
}

const addTag = async (addresses: EntityObject[], tag: Entity) => {
  if (addresses.length === 0) {
    console.log("No addresses to tag")
    return
  }

  const updatedUsersTags = await prisma.$queryRaw<
    { address: string; tags: string[] }[]
  >(
    Prisma.sql`
    UPDATE "UserAddress"
    SET "tags" = array_append("tags", ${tag})
    WHERE "address" = ANY(${Prisma.sql`ARRAY[${Prisma.join(
      addresses.map((address) => address.address),
    )}]::text[]`})
    RETURNING "address", "tags"
  `,
  )

  console.log(`Updated user addresses, added tag "${tag}"`)

  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const results = await mailchimp.lists.batchListMembers(LIST_ID!, {
    members: addresses.map((address) => ({
      email_address: address.email,
      tags: [
        ...(updatedUsersTags.find((user) => user.address === address.address)
          ?.tags ?? []),
        tag,
      ],
      email_type: "html",
      status: "transactional",
    })),
    update_existing: true,
  })

  const updatedMembers = (results as any).updated_members.map(
    (member: any) => ({
      email: member.email_address,
      tags: member.tags,
    }),
  )

  console.log(`Added tags to ${updatedMembers.length} Mailchimp contacts`)
}

const removeTags = async (addresses: EntityObject[], tag: Entity) => {
  if (addresses.length === 0) {
    console.log("No addresses to tag")
    return
  }

  await prisma.userAddress.updateMany({
    where: {
      address: {
        in: addresses.map((address) => address.address),
      },
    },
    data: {
      tags: [],
    },
  })

  console.log(`Updated user addresses, removed tag "${tag}"`)

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
}

const handleAddCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  await addTag(records.citizen, "citizen")
}
const handleAddRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {}
const handleAddBadgeholderEntity = async (
  records: Record<"badgeholder", EntityObject[]>,
) => {}
const handleAddGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {}

const handleRemoveCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  await removeTags(records.citizen, "citizen")
}
const handleRemoveRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {}
const handleRemoveBadgeholderEntity = async (
  records: Record<"badgeholder", EntityObject[]>,
) => {}
const handleRemoveGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {}
