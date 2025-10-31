import { format } from "date-fns"

export const formatMMMdyyyy = (date: Date) => {
  return format(date, "MMM d, yyyy")
}

export const formatMMMd = (date: Date) => {
  return format(date, "MMM d")
}

export const formatDateRange = (start: Date, end: Date) => {
  const sameYear = start.getFullYear() === end.getFullYear()
  const startFormat = sameYear ? "MMM d" : "MMM d, yyyy"
  const endFormat = "MMM d, yyyy"

  return `${format(start, startFormat)} – ${format(end, endFormat)}`
}

export const formatDateLong = (date: Date) => {
  return format(date, "MMMM d, yyyy")
}
