export default async function apiFetch(
  endpoint: string,
  opts: RequestInit = {},
) {
  const prefix = process.env.NODE_ENV === "development" ? "" : "https"
  const API_URL = `${prefix}://${process.env.NEXT_PUBLIC_VERCEL_URL}`

  return await fetch(`${API_URL}/${endpoint}`, opts)
}
