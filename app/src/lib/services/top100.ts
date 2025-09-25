import { prisma } from "@/db/client"

const DEV_TOP100_BYPASS = new Set([
  "0xbb8dbd9cc7ada9f4e31d4bd8c7a0410f2333c81a",
  "0x301987c30f12117f2c2e20bf46b7f420123e8068",
  "0x47e7cee058e7e33da6ea2ba9ba7a14ae5d7e8cc4",
  "0x4f9ccd8c2d017ead0cdaac6692c9bc96c92e53",
  "0xb612723059eee9bf5ca79b1ea58ef94cb3abb8a6",
])

export async function isTop100Delegate(addresses: string[]): Promise<boolean> {
  const lower = addresses.map((a) => a.toLowerCase())
  if (lower.length === 0) return false

  if (
    process.env.NEXT_PUBLIC_ENV === "dev" &&
    lower.some((address) => DEV_TOP100_BYPASS.has(address))
  ) {
    return true
  }

  try {
    // Build padded 32-byte versions of addresses (left-pad with 24 zeros)
    const padded = lower.map(
      (address) => ("0x" + "0".repeat(24) + address.slice(2)) as string,
    )
    const rows = await prisma.$queryRaw<{ is_top100: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM public."TopDelegates"
        WHERE lower(recipient) = ANY(${padded})
      ) AS is_top100;
    `
    return !!rows?.[0]?.is_top100
  } catch {
    return false
  }
}
