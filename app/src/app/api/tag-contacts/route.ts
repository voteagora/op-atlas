import { NextRequest } from "next/server"

import { addTag, EntityObject, removeTags } from "@/db/users"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import { fetchRecords, mergeResultsByEmail } from "@/lib/utils/tags"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
    await addTagsToContacts()

    return new Response(`Mailchimp contacts tagged`, { status: 200 })
  }
  if (task === "remove") {
    await removeTagsFromContacts()

    return new Response(`Mailchimp contacts untagged`, { status: 200 })
  }

  return new Response(`Task not found`, { status: 404 })
}

const addTagsToContacts = async () => {
  const records = await fetchRecords()

  const [
    citizens,
    gov_contributions,
    rf_voters,
    community_contributors,
    onchain_builders,
    githubrepo_builders,
  ] = await Promise.all([
    handleAddCitizenEntity({ citizen: records.citizen }),
    handleAddGovContributionEntity({
      gov_contribution: records.gov_contribution,
    }),
    handleAddRfVoterEntity({ rf_voter: records.rf_voter }),
    handleAddCommunityContributorEntity({ contributors: records.contributors }),
    handleAddOnchainBuilderEntity({
      onchain_builders: records.onchain_builders,
    }),
    handleAddGithubRepoBuilderEntity({
      github_repo_builders: records.github_repo_builders,
    }),
  ])

  const flattenedUsers = mergeResultsByEmail([
    citizens ?? [],
    gov_contributions ?? [],
    rf_voters ?? [],
    community_contributors ?? [],
    onchain_builders ?? [],
    githubrepo_builders ?? [],
    records.community_contributors?.map((c) => ({
      email: c.email,
      tags: ["Community Contributor"],
    })),
  ])
  if (!flattenedUsers) return

  await updateMailchimpTags(flattenedUsers)
}
const removeTagsFromContacts = async () => {
  const records = await fetchRecords()

  const flattenedUsers = await removeTags(records, [
    "citizen",
    "gov_contribution",
    "rf_voter",
    "contributors",
    "onchain_builders",
    "github_repo_builders",
  ])
  if (!flattenedUsers) return

  await updateMailchimpTags(flattenedUsers)
}

const handleAddCitizenEntity = async (
  records?: Record<"citizen", EntityObject[]>,
) => {
  return await addTag(records?.citizen ?? [], "citizen")
}
const handleAddRfVoterEntity = async (
  records?: Record<"rf_voter", EntityObject[]>,
) => {
  return (await addTag(records?.rf_voter ?? [], "rf_voter")) ?? []
}
const handleAddGovContributionEntity = async (
  records?: Record<"gov_contribution", EntityObject[]>,
) => {
  return await addTag(records?.gov_contribution ?? [], "gov_contribution")
}
const handleAddCommunityContributorEntity = async (
  records?: Record<"contributors", EntityObject[]>,
) => {
  return await addTag(records?.contributors ?? [], "contributors")
}
const handleAddOnchainBuilderEntity = async (
  records?: Record<"onchain_builders", EntityObject[]>,
) => {
  return await addTag(records?.onchain_builders ?? [], "onchain_builders")
}
const handleAddGithubRepoBuilderEntity = async (
  records?: Record<"github_repo_builders", EntityObject[]>,
) => {
  return await addTag(
    records?.github_repo_builders ?? [],
    "github_repo_builders",
  )
}
