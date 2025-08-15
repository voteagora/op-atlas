function inspectForEnv(value: any): string {
  // Avoid Node-only APIs in Edge: rely on NEXT_RUNTIME which Next injects at build time
  const isNode = process.env.NEXT_RUNTIME !== "edge"
  if (isNode) {
    try {
      const nodeUtil = eval("require")("util") as typeof import("util")
      return nodeUtil.inspect(value, {
        showHidden: false,
        depth: null,
        colors: true,
      })
    } catch {
      // Fallback if require is unavailable
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const timeThis = async <T>(
  fn: () => Promise<T>,
  log_fields: Record<string, any>,
) => {
  if (process.env.NODE_ENV === "production") {
    return await fn()
  }

  if (process.env.IS_DB_DEBUG === "true") {
    const start = performance.now()
    try {
      return await fn()
    } catch (error) {
      throw error
    } finally {
      const end = performance.now()
      console.log(inspectForEnv({ ...log_fields, time: end - start }))
    }
  } else {
    try {
      return await fn()
    } catch (error) {
      throw error
    }
  }
}
