import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/db/client"
import { OSO_METRICS } from "@/lib/constants"
import osoClient from "@/lib/oso-client"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params

  // TODO: Do something here

  return NextResponse.json({ projectId })
}
