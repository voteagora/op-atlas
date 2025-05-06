import { NextRequest } from "next/server"

import { mapOSOProjects } from "@/lib/oso"
import { getOSOMappedProjectIds } from "@/db/projects"
import { withCronObservability } from "@/lib/cron"

export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-oso-map-projects"

async function handleOSOMapProjectsCron(request: NextRequest) {
  const projectAtlasIds = await getOSOMappedProjectIds()

  const { mapped } = await mapOSOProjects(projectAtlasIds)

  return Response.json({
    status: 200,
    body: { message: "Success", count: mapped },
  })
}

export const GET = withCronObservability(handleOSOMapProjectsCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
