import { getUser as getGithubUser } from "../github"

export const getUser = async (username: string) => {
  const user = await getGithubUser(username)
  return user
}
