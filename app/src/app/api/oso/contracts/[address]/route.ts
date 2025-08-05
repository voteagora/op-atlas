import { NextResponse } from "next/server"

import { recordApiRequest } from "@/lib/metrics"
import { getDeployedContractsServer } from "@/lib/oso"

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const startTime = Date.now()
  const { address } = params

  try {
    const contracts = await getDeployedContractsServer(address)
    const duration = (Date.now() - startTime) / 1000

    recordApiRequest("GET", "/api/oso/contracts/[address]", 200, duration)
    return NextResponse.json(contracts)
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000
    recordApiRequest("GET", "/api/oso/contracts/[address]", 500, duration)

    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 },
    )
  }
}
