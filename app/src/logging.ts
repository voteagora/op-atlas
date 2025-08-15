function inspectForEnv(value: any): string {
  // Edge-safe: avoid Node-only APIs and dynamic evaluation
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
