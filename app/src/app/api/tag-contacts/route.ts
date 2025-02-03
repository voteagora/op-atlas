import { TAG_BY_ENTITY } from "eas-indexer/src/constants"
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

  const flattenedUsers = await removeTags(records, [
    "citizen",
    "gov_contribution",
    "rf_voter",
    "contributors",
    "onchain_builders",
    "github_repo_builders",
  ])
  if (!flattenedUsers) return

  flattenedUsers.forEach((user) => {
    console.log(`  - ${user.email}; tags: ${user.tags.join(", ")};`)
  })

  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  await mailchimp.lists
    .batchListMembers(LIST_ID!, {
      members: flattenedUsers.map((user) => ({
        email_address: user.email,
        tags: user.tags ?? [],
        email_type: "html",
        status: "transactional",
      })),
      sync_tags: true,
      update_existing: true,
    })
    .then((results: any) => {
      console.log(
        `[+] Mailchimp contacts untagged: ${results.updated_members.length}`,
      )
      results.updated_members.forEach((member: any) => {
        const memberTags = member.tags.map((t: any) => t.name).join(", ")
        if (!memberTags.length) {
          console.log(`  - ${member.email_address}; tags: []`)
          return
        }

        console.log(`  - ${member.email_address}; tags: ${memberTags};`)
      })
    })
    .catch((error: any) => {
      console.error(`[-] Mailchimp contacts untagging failed: ${error}`)
    })
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
    return usersToUpdate
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

  // Extract unique emails from all entity records
  const emailsToUpdate = Array.from(
    new Set(
      Object.values(addresses)
        .flat()
        .map((a) => a.email),
    ),
  )

  let retries = 5
  let remainingUsers = emailsToUpdate

  while (retries > 0 && remainingUsers.length > 0) {
    const usersToUpdate = await prisma.userEmail.findMany({
      where: {
        email: { in: remainingUsers },
        tags: { hasSome: tagsToRemove }, // Users that have at least one of the tags
      },
      select: {
        id: true,
        email: true,
        tags: true,
      },
    })

    if (usersToUpdate.length === 0) break // All updates done

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

    // Fetch users that still have any of the tags
    const updatedUsersTags = await prisma.userEmail.findMany({
      where: {
        email: { in: usersToUpdate.map((u) => u.email) },
        tags: { hasSome: tagsToRemove },
      },
      select: { email: true, tags: true },
    })

    remainingUsers = updatedUsersTags.map((u) => u.email)
    retries--

    if (remainingUsers.length > 0) {
      console.warn(
        `Retrying removal for ${remainingUsers.length} users... ${retries} retries left`,
      )
      await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay for DB consistency
    }
  }

  return await prisma.userEmail.findMany({
    where: { email: { in: emailsToUpdate } },
    select: { email: true, tags: true },
  })
}

// TODO: Fix not all tags being removed
const removeTags_old = async (addresses: EntityObject[], tag: Entity) => {
  if (addresses.length === 0) return

  let updatedUserTag = TAG_BY_ENTITY[tag] || ""
  if (!updatedUserTag) return

  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: { in: addresses.map((a) => a.email) },
      tags: { has: updatedUserTag },
    },
    select: {
      id: true,
      email: true,
      tags: true,
    },
  })

  if (usersToUpdate.length === 0) return usersToUpdate

  const mergedUsersToUpdate = mergeResultsByEmail([usersToUpdate])

  await prisma.$transaction(
    mergedUsersToUpdate.map((user) => {
      const newTags = user.tags.filter((t) => t !== updatedUserTag)

      return prisma.userEmail.update({
        where: { id: user.id },
        data: { tags: { set: newTags } },
      })
    }),
  )

  const updatedUsersTags = await prisma.userEmail.findMany({
    where: { email: { in: usersToUpdate.map((u) => u.email) } },
    select: { email: true, tags: true },
  })

  return updatedUsersTags
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
