import { recordExternalApiCall } from "./metrics"

interface GraphQLResponse<T = any> {
  data?: T
  errors?: { message: string }[]
}

type ReturnData<T> = (keyof T)[]

const ENUM_VALUES = ["Asc", "Desc"]

class OsoClient {
  private static instance: OsoClient
  private endpoint: string
  private headers: Record<string, string>

  private constructor(
    endpoint: string = "https://www.opensource.observer/api/v1/graphql",
  ) {
    this.endpoint = endpoint
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OSO_AUTH_TOKEN}`,
    }
  }

  static getInstance(): OsoClient {
    if (!OsoClient.instance) {
      OsoClient.instance = new OsoClient()
    }
    return OsoClient.instance
  }

  buildQuery(query: Record<string, any>, select: string[]) {
    const formatValue = (value: any): string => {
      if (typeof value === "string") {
        // Don't wrap enums in quotes
        if (ENUM_VALUES.includes(value)) {
          return value
        }
        return `"${value}"` // wrap strings in quotes
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return `${value}` // keep numbers and booleans as is
      }
      if (Array.isArray(value)) {
        return `[${value.map(formatValue).join(", ")}]` // format arrays properly
      }
      if (typeof value === "object" && value !== null) {
        return `{ ${Object.entries(value)
          .map(([key, val]) => `${key}: ${formatValue(val)}`)
          .join(", ")} }`
      }
      return ""
    }

    const gqlQuery = Object.entries(query)
      .map(([key, value]) => `${key}: ${formatValue(value)}`)
      .join(", ")
    const gqlSelect = `{${select.join("\n")}}`

    return { gqlQuery, gqlSelect }
  }

  async executeQuery<T, K extends string>(
    typename: K,
    query: Record<string, any>,
    select: ReturnData<T>,
  ): Promise<{ [key in K]: Pick<T, keyof T>[] }> {
    const startTime = Date.now()
    const { gqlQuery, gqlSelect } = this.buildQuery(query, select.map(String))

    const params = Boolean(gqlQuery) ? `(${gqlQuery})` : ""
    const result = `query result {
        ${typename}${params}${gqlSelect}
      }`

    const queryString = result.replace(/\s+/g, " ").trim()
    const payload = JSON.stringify({ query: queryString })

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: this.headers,
        body: payload,
      })

      const duration = (Date.now() - startTime) / 1000

      if (!response.ok) {
        const errorText = await response.text()
        recordExternalApiCall("oso", typename, "POST", response.status, duration)
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`,
        )
      }

      const result: GraphQLResponse<T> = await response.json()

      if (result.errors) {
        const errorMsg = result.errors.map((error) => error.message).join("\n")
        recordExternalApiCall("oso", typename, "POST", 400, duration)
        throw new Error(`GraphQL Error: ${errorMsg}`)
      }

      recordExternalApiCall("oso", typename, "POST", 200, duration)
      return result.data as { [key in K]: Pick<T, keyof T>[] }
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000
      recordExternalApiCall("oso", typename, "POST", 500, duration)
      
      if (error instanceof Error) {
        throw new Error(`Request Error: ${error.message}`)
      }
      throw error
    }
  }
}

export default OsoClient.getInstance()
