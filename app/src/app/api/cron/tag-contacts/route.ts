import { NextRequest } from "next/server"

import { addTags } from "@/db/users"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import { withCronObservability } from "@/lib/cron"
import { fetchRecords, mergeResultsByEmail } from "@/lib/utils/tags"

export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-tag-contacts"

async function handleTagContactsCron(request: NextRequest) {
  const records = await fetchRecords()
  const flattenedUsers = await addTags(records)
  await updateMailchimpTags(mergeResultsByEmail([flattenedUsers]))

  return new Response(`Mailchimp contacts tagged`, { status: 200 })
}

export const GET = withCronObservability(handleTagContactsCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
