import { Octokit } from "octokit"

// TODO: Add API key for higher rate limits
const octokit = new Octokit({})

export async function getRepository(owner: string, slug: string) {
  return await octokit.rest.repos.get({ owner, repo: slug })
}

export async function getFundingFile(owner: string, slug: string) {
  return await octokit.rest.repos.getContent({
    owner,
    repo: slug,
    path: "funding.json",
  })
}
