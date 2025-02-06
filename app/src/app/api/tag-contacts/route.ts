import { NextRequest } from "next/server"

import { addTags } from "@/db/users"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import { fetchRecords } from "@/lib/utils/tags"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const records = await fetchRecords()
    const flattenedUsers = await addTags(records)
    await updateMailchimpTags(flattenedUsers)
  } catch (error) {
    console.error("Error tagging contacts", error)
    return new Response(`Error tagging contacts: ${error}`, { status: 500 })
  }

  return new Response(`Mailchimp contacts tagged`, { status: 200 })
}
