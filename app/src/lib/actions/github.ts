import { getUser } from "../github"

export const getGithubUser = async (username: string) => {
  try {
    const user = await getUser(username)
    if (user) {
      return {
        error: null,
        user: user ?? null,
      }
    }
  } catch (error: unknown) {
    console.error("Error searching for user", (error as Error).message)
    return {
      error: "Error searching for user",
    }
  }
}
