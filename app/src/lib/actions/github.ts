import { getUser as getGithubUser } from "../github"

export const getUser = async (username: string) => {
  try {
    const user = await getGithubUser(username)
    if (user) {
      return {
        error: null,
        user: user.data ?? null,
      }
    }
  } catch (error: unknown) {
    console.error("Error searching for user", (error as Error).message)
    return {
      error: "Error searching for user",
    }
  }
}
