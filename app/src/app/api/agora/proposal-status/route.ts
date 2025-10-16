import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const proposalId = req.nextUrl.searchParams.get("id")
  if (!proposalId) {
    return NextResponse.json(
      { ok: false, reason: "missing id" },
      { status: 400 },
    )
  }
  try {
    const url = `https://vote.optimism.io/proposals/${proposalId}`
    const res = await fetch(url, { method: "HEAD" })
    // Consider 200-399 as ok
    const ok = res.status >= 200 && res.status < 400
    return NextResponse.json({ ok, status: res.status })
  } catch (e) {
    return NextResponse.json({ ok: false, reason: "network" }, { status: 502 })
  }
}
