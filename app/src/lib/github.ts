import { Octokit } from "octokit"

// console.log(process.env)
// console.log(process.env.GITHUB_AUTH_TOKEN)

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
})

export async function getUser(username: string) {
  return await octokit.rest.users.getByUsername({ username })
}

export async function getRepository(owner: string, slug: string) {
  return await octokit.rest.repos.get({ owner, repo: slug })
}

export async function getFile(owner: string, slug: string, path: string) {
  return await octokit.rest.repos.getContent({
    owner,
    repo: slug,
    path,
  })
}

// Fetch the SPDX license ID for a repository
export async function getLicense(owner: string, slug: string) {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/license", {
      owner,
      repo: slug,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    return result.data.license?.spdx_id
  } catch (error: unknown) {
    return null
  }
}
