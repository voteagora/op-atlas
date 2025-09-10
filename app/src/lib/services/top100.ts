export async function isTop100Delegate(addresses: string[]): Promise<boolean> {
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase())))
  if (unique.length === 0) return false

  const baseUrl = process.env.TOP100_API_URL
  const apiKey = process.env.TOP100_API_KEY
  if (!baseUrl) {
    // Service not configured yet; keep gated off
    return false
  }

  const url = new URL("/isTop100", baseUrl)
  for (const addr of unique) url.searchParams.append("addresses", addr)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) return false
    const data = await res.json()
    if (typeof data?.isTop100 === "boolean") return data.isTop100
    if (Array.isArray(data?.active)) {
      const active = new Set(
        (data.active as string[]).map((a) => a.toLowerCase()),
      )
      return unique.some((a) => active.has(a))
    }
    if (Array.isArray(data)) {
      const active = new Set((data as string[]).map((a) => a.toLowerCase()))
      return unique.some((a) => active.has(a))
    }
    return false
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}
