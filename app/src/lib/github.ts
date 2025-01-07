import { Octokit } from "octokit"

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
})

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

export async function getNpmPackage(name: string) {
  const url = `https://registry.npmjs.org/${encodeURIComponent("eth-crypto")}`
  const response = await fetch(url)
  const npmPackage = await response.json()
  return npmPackage
}

export async function getPackageJson(owner: string, slug: string) {
  try {
    const result = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/package.json",
      {
        owner,
        repo: slug,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    )

    const packageJsonContent = Buffer.from(
      result.data.content,
      "base64",
    ).toString("utf-8")
    const packageJson = JSON.parse(packageJsonContent) // Parse the JSON

    return packageJson
  } catch (error: unknown) {
    return null
  }
}
