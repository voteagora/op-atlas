import { format } from "date-fns"

export const formatMMMdyyyy = (date: Date) => {
  return format(date, "MMM d, yyyy")
}

export const formatMMMd = (date: Date) => {
  return format(date, "MMM d")
}
