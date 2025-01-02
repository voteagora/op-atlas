import { createFetchClient } from "@/lib/api/common"

export const githubClient = createFetchClient("https://api.github.com", {
  Authorization: `token ${process.env.GITHUB_AUTH_TOKEN}`,
})
