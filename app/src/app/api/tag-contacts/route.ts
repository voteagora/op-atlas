import { NextRequest } from "next/server"

import { prisma } from "@/db/client"

export const dynamic = "force-dynamic"

type Entity = "badgeholder" | "citizen" | "gov_contribution" | "rf_voter"
type EntityRecords = Record<Entity, string[]>

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
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

  return records
}

const handleAddCitizenEntity = async (
  records: Record<"citizen", string[]>,
) => {}
const handleAddBadgeholderEntity = async (
  records: Record<"badgeholder", string[]>,
) => {}
const handleAddGovContributionEntity = async (
  records: Record<"gov_contribution", string[]>,
) => {}
const handleAddRfVoterEntity = async (
  records: Record<"rf_voter", string[]>,
) => {}

const handleRemoveCitizenEntity = async (
  records: Record<"citizen", string[]>,
) => {}
const handleRemoveBadgeholderEntity = async (
  records: Record<"badgeholder", string[]>,
) => {}
const handleRemoveGovContributionEntity = async (
  records: Record<"gov_contribution", string[]>,
) => {}
const handleRemoveRfVoterEntity = async (
  records: Record<"rf_voter", string[]>,
) => {}
