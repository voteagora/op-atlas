import { prisma } from "@/db/client"

export async function isTop100Delegate(addresses: string[]): Promise<boolean> {
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase())))
  if (unique.length === 0) return false

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
