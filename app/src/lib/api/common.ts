export const createFetchClient = (
  baseURL: string,
  defaultHeaders: Record<string, string> = {},
) => {
  return async (endpoint: string, options: RequestInit = {}) => {
    const url = `${baseURL}${endpoint}`
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(
        `Fetch error: ${response.status} ${response.statusText} - ${url}`,
      )
    }

    return response.json()
  }
}
