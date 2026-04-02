import { cache as reactCache } from "react"

export const cache: typeof reactCache =
  typeof reactCache === "function"
    ? reactCache
    : (((fn: (...args: any[]) => any) => fn) as typeof reactCache)
