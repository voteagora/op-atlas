import { prisma } from "@/db/client"

const DEV_TOP100_BYPASS = new Set([
  "0xbb8dbd9cc7ada9f4e31d4bd8c7a0410f2333c81a",
])

export async function isTop100Delegate(addresses: string[]): Promise<boolean> {
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase())))
  if (unique.length === 0) return false

  if (
    process.env.NEXT_PUBLIC_ENV === "dev" &&
    unique.some((address) => DEV_TOP100_BYPASS.has(address))
  ) {
    return true
  }

  try {
    const rows = await prisma.$queryRaw<{ is_top100: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM public."TopDelegates"
        WHERE lower(recipient) = ANY(${unique})
      ) AS is_top100;
    `
    return !!rows?.[0]?.is_top100
  } catch {
    return false
  }
}
