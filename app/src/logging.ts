import * as util from "util"

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
      console.log(
        util.inspect(
          { ...log_fields, time: end - start },
          { showHidden: false, depth: null, colors: true },
        ),
      )
    }
  } else {
    try {
      return await fn()
    } catch (error) {
      throw error
    }
  }
}
