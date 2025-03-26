export default async function apiFetch(
  endpoint: string,
  opts: RequestInit = {},
) {
  const API_URL = process.env.NEXT_PUBLIC_URL

  return await fetch(`${API_URL}/${endpoint}`, opts)
}
