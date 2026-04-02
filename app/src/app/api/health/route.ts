import { prisma } from "@/db/client"

export const dynamic = "force-dynamic"

export async function GET() {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      db_latency_ms: Date.now() - start,
    })
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database unreachable",
      },
      { status: 503 },
    )
  }
}
