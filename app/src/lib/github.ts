import { Octokit } from "octokit"
import toml from "toml"

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
})

export async function getRepository(owner: string, slug: string) {
  return await octokit.rest.repos.get({ owner, repo: slug })
}

export async function getFileOrFolder(
  owner: string,
  slug: string,
  path: string,
) {
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

export const getContents = async (owner: string, slug: string) => {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/contents", {
      owner,
      repo: slug,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    return result.data
  } catch (error: unknown) {
    return null
  }
}

export const getFilesContentsToml = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  return await Promise.all(
    paths.map((path) => getFileContentToml(owner, repo, path)),
  )
}

export const getFilesContentsJson = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  return await Promise.all(
    paths.map((path) => getFileContentJson(owner, repo, path)),
  )
}

const getFileContentToml = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  const base64Decoded = await getFileContentBase64Decoded(owner, repo, path)
  return JSON.parse(JSON.stringify(toml.parse(base64Decoded)))
}

const getFileContentJson = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  const base64Decoded = await getFileContentBase64Decoded(owner, repo, path)
  return JSON.parse(base64Decoded)
}

const getFileContentBase64Decoded = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  try {
    const response = await getFileOrFolder(owner, repo, path)
    if ((response.data as any).encoding === "base64") {
      return Buffer.from((response.data as any).content, "base64").toString(
        "utf-8",
      ) as any
    }
  } catch (error: unknown) {
    console.error("Error getting file contents:", error)
    return null
  }
}
