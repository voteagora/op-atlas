import { Prisma } from "@prisma/client"
import { CONTRIBUTOR_ELIGIBLE_ADDRESSES } from "eas-indexer/src/constants"
import { type AggregatedType } from "eas-indexer/src/types"
import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import { getAggregatedRecords } from "@/db/users"
import { getAggregatedData } from "@/lib/api/eas/aggregated"
import mailchimp from "@/lib/mailchimp"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Entity = keyof AggregatedType
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
    citizens,
    gov_contributions,
    rf_voters,
    community_contributors,
    onchain_builders,
    githubrepo_builders,
  ])

  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  await mailchimp.lists
    .batchListMembers(LIST_ID!, {
      members: flattenedUsers.map((user) => ({
        email_address: user.email,
        tags: user.tags ?? [],
        email_type: "html",
        status: "transactional",
      })),
      update_existing: true,
    })
    .then((results: any) => {
      console.log(
        `[+] Mailchimp contacts tagged: ${results.updated_members.length}`,
      )
      results.updated_members.forEach((member: any) => {
        console.log(
          `  - ${member.email_address}; tags: ${
            flattenedUsers.find((m) => {
              return m.email === member.email_address
            })?.tags
          };`,
        )
      })
    })
    .catch((error: any) => {
      console.error(`[-] Mailchimp contacts tagging failed: ${error}`)
    })
}
const removeTagsFromContacts = async () => {
  const records = await fetchRecords()

  await Promise.all([
    handleRemoveCitizenEntity({ citizen: records.citizen }),
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

  return result as any
}

// TODO: Move the association of tags to UserEmails instead
const addTag = async (addresses: EntityObject[], tag: Entity) => {
  if (addresses.length === 0) {
    return
  }

  let updatedUserTag = ""
  switch (tag) {
    case "gov_contribution":
      updatedUserTag = "S7 Elected Official"
      break
    case "rf_voter":
      updatedUserTag = "Guest Voter"
      break
    case "citizen":
      updatedUserTag = "Citizen"
      break
    case "contributors":
      updatedUserTag = "Contributor"
      break
    case "community_contributors":
      updatedUserTag = "Community Contributor"
      break
    case "onchain_builders":
      updatedUserTag = "Onchain Builder"
      break
    case "github_repo_builders":
      updatedUserTag = "Github Repo"
      break
    default:
      updatedUserTag = ""
      break
  }

  if (!updatedUserTag) {
    console.error("Invalid tag")
    return
  }

  const updatedUsersTags = await prisma
    .$queryRaw<{ address: string; tags: string[]; email: string }[]>(
      Prisma.sql`
    UPDATE "UserAddress"
    SET "tags" = CASE 
      WHEN NOT (tags @> ARRAY[${updatedUserTag}]) THEN array_append(tags, ${updatedUserTag}) 
      ELSE tags 
    END
    WHERE "address" = ANY(${Prisma.sql`ARRAY[${Prisma.join(
      addresses.map((a) => Prisma.sql`${a.address}`),
    )}]::text[]`})
    RETURNING "address", "tags", 
      (SELECT ue.email FROM "UserEmail" ue 
       WHERE ue."userId" = "UserAddress"."userId"
       LIMIT 1) AS email
  `,
    )
    .catch((_) => {
      return []
    })

  return mergeResultsByEmail([updatedUsersTags])
}

// TODO: Remove only relevant tags that come from the eas-indexer
const removeTags = async (addresses: EntityObject[], tag: Entity) => {
  if (addresses.length === 0) {
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
}

const handleAddCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  return (await addTag(records.citizen, "citizen")) ?? []
}
const handleAddRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {
  return (await addTag(records.rf_voter, "rf_voter")) ?? []
}
const handleAddGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {
  return (await addTag(records.gov_contribution, "gov_contribution")) ?? []
}
const handleAddCommunityContributorEntity = async (
  records: Record<"contributors", EntityObject[]>,
) => {
  return (await addTag(records.contributors, "contributors")) ?? []
}
const handleAddOnchainBuilderEntity = async (
  records: Record<"onchain_builders", EntityObject[]>,
) => {
  return (await addTag(records.onchain_builders, "onchain_builders")) ?? []
}
const handleAddGithubRepoBuilderEntity = async (
  records: Record<"github_repo_builders", EntityObject[]>,
) => {
  return (
    (await addTag(records.github_repo_builders, "github_repo_builders")) ?? []
  )
}

const handleRemoveCitizenEntity = async (
  records: Record<"citizen", EntityObject[]>,
) => {
  await removeTags(records.citizen, "citizen")
}
const handleRemoveRfVoterEntity = async (
  records: Record<"rf_voter", EntityObject[]>,
) => {
  await removeTags(records.rf_voter, "rf_voter")
}
const handleRemoveGovContributionEntity = async (
  records: Record<"gov_contribution", EntityObject[]>,
) => {
  await removeTags(records.gov_contribution, "gov_contribution")
}

const mergeResultsByEmail = (
  lists: { email: string; tags: string[] }[][],
): { email: string; tags: string[] }[] => {
  const mergedMap = new Map<string, Set<string>>()

  const flatLists = lists.flat()

  flatLists.forEach(({ email, tags }) => {
    if (!mergedMap.has(email)) {
      mergedMap.set(email, new Set(tags))
    } else {
      tags?.forEach((tag) => mergedMap.get(email)!.add(tag))
    }
  })

  return Array.from(mergedMap.entries()).map(([email, tags]) => ({
    email,
    tags: Array.from(tags), // Convert Set to array to remove duplicates
  }))
}
