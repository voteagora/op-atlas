import { TAG_BY_ENTITY } from "eas-indexer/src/constants"
import { type AggregatedType } from "eas-indexer/src/types"
import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import { getAggregatedRecords } from "@/lib/actions/tags"
import { getAggregatedData } from "@/lib/api/eas/aggregated"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
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
    return
  }

  let updatedUserTag = TAG_BY_ENTITY[tag] || ""
  if (!updatedUserTag) {
    console.error("Invalid tag")
    return
  }

  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: {
        in: addresses.map((a) => a.email),
      },
      NOT: {
        tags: {
          has: updatedUserTag,
        },
      },
    },
    select: {
      email: true,
      tags: true,
    },
  })

  if (usersToUpdate.length === 0) {
    return await prisma.userEmail.findMany({
      where: {
        email: {
          in: addresses.map((a) => a.email),
        },
      },
      select: {
        email: true,
        tags: true,
      },
    })
  }

  await prisma.userEmail.updateMany({
    where: {
      email: {
        in: usersToUpdate.map((u) => u.email),
      },
    },
    data: {
      tags: {
        push: updatedUserTag,
      },
    },
  })

  const updatedUsersTags = await prisma.userEmail.findMany({
    where: {
      email: {
        in: usersToUpdate.map((u) => u.email),
      },
    },
    select: {
      email: true,
      tags: true,
    },
  })

  return mergeResultsByEmail([updatedUsersTags])
}

const removeTags = async (addresses: EntityRecords, tags: Entity[]) => {
  if (
    !tags.length ||
    Object.values(addresses).every((list) => list.length === 0)
  )
    return

  const tagsToRemove = tags.map((tag) => TAG_BY_ENTITY[tag]).filter(Boolean)
  if (!tagsToRemove.length) return

  const emailsToUpdate = Array.from(
    new Set(
      Object.values(addresses)
        .flat()
        .map((a) => a.email),
    ),
  )
  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: { in: emailsToUpdate },
      tags: { hasSome: tagsToRemove },
    },
    select: {
      id: true,
      email: true,
      tags: true,
    },
  })

  await prisma.$transaction(
    usersToUpdate.map((user) =>
      prisma.userEmail.update({
        where: { id: user.id },
        data: {
          tags: { set: user.tags.filter((t) => !tagsToRemove.includes(t)) },
        },
      }),
    ),
  )

  return await prisma.userEmail.findMany({
    where: { email: { in: emailsToUpdate } },
    select: { email: true, tags: true },
  })
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

const mergeResultsByEmail = (
  lists: { id?: string; email: string; tags: string[] }[][],
): { id?: string; email: string; tags: string[] }[] => {
  const mergedMap = new Map<string, { id?: string; tags: Set<string> }>()

  const flatLists = lists.filter((list) => Boolean(list)).flat()

  flatLists.forEach(({ id, email, tags }) => {
    if (!mergedMap.has(email)) {
      mergedMap.set(email, { id, tags: new Set(tags) })
    } else {
      const existingEntry = mergedMap.get(email)!
      tags?.forEach((tag) => existingEntry.tags.add(tag))

      // If the existing entry has no ID but the new entry does, update it
      if (!existingEntry.id && id) {
        existingEntry.id = id
      }
    }
  })

  return Array.from(mergedMap.entries()).map(([email, { id, tags }]) => ({
    id,
    email,
    tags: Array.from(tags), // Convert Set to array to remove duplicates
  }))
}
