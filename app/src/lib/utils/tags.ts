import { EntityRecords } from "@/db/users"
import { getAggregatedRecords } from "@/lib/actions/tags"
import { getAggregatedData } from "@/lib/api/eas/aggregated"

export const mergeResultsByEmail = (
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

      if (!existingEntry.id && id) {
        existingEntry.id = id
      }
    }
  })

  return Array.from(mergedMap.entries()).map(([email, { id, tags }]) => ({
    id,
    email,
    tags: Array.from(tags),
  }))
}

export const fetchRecords = async (): Promise<EntityRecords> => {
  const records = await getAggregatedData()
  const result = await getAggregatedRecords(records)

  return result
}
