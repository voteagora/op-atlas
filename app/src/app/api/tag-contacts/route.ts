export const dynamic = "force-dynamic"

export function GET(request: Request) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  return new Response(`Tagging Mailchimp contacts...`, { status: 200 })
}
