export const INDEXED_MONTHS = {
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
}
export const MONTHS = Object.values(INDEXED_MONTHS)

export const TRANSACTIONS_THRESHOLD = 1000
export const QUALIFIED_ADDRESSES_THRESHOLD = 420
export const DISTINCT_DAYS_THRESHOLD = 10

export function getDaysInMonthByName(
  monthName: string,
  year = new Date().getFullYear(),
): number {
  const monthEntry = Object.entries(INDEXED_MONTHS).find(
    ([, name]) => name === monthName,
  )

  if (!monthEntry) throw new Error(`Invalid month: ${monthName}`)

  const monthIndex = Number(monthEntry[0])

  return new Date(year, monthIndex, 0).getDate()
}
