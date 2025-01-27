import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams

  const task = searchParams.get("task")
  if (task === "add") {
    console.log("Adding tags to Mailchimp contacts...")

    // Add tags to contacts

    return new Response(`Mailchimp contacts tagged`, { status: 200 })
  }
  if (task === "remove") {
    console.log("Removing tags from Mailchimp contacts...")

    // Remove tags from contacts

    return new Response(`Mailchimp contacts untagged`, { status: 200 })
  }

  return new Response(`Task not found`, { status: 404 })
}
