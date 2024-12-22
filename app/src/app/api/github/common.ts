import { createFetchClient } from "@/lib/api/common"

export const githubClient = createFetchClient("https://api.github.com", {
  Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
})
