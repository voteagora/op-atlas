import { NextResponse } from "next/server"

import { getDeployedContractsServer } from "@/lib/oso"

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params

  const contracts = await getDeployedContractsServer(address)

  return NextResponse.json(contracts)
}
