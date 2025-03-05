import { PostHog } from "posthog-node"

class PostHogClient {
  private static instance: PostHog

  private constructor() {}

  public static getInstance(): PostHog {
    const POSTHOG_KEY = process.env.SERVER_POSTHOG_KEY
    const POSTHOG_HOST = process.env.SERVER_POSTHOG_HOST
    if (!POSTHOG_KEY) {
      throw new Error(
        "Please define SERVER_POSTHOG_KEY in your environment variables",
      )
    }
    if (!POSTHOG_HOST) {
      throw new Error(
        "Please define SERVER_POSTHOG_HOST in your environment variables",
      )
    }

    if (!PostHogClient.instance) {
      PostHogClient.instance = new PostHog(POSTHOG_KEY, {
        host: POSTHOG_HOST,
      })
    }
    return PostHogClient.instance
  }
}

export default PostHogClient.getInstance()
