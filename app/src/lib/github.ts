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
  const result = await octokit.request("GET /repos/{owner}/{repo}/contents", {
    owner,
    repo: slug,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })

  return result.data
}

export const findAllFilesRecursively = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  try {
    const response = await getFileOrFolder(owner, repo, path)

    const files = []

    for (const item of response.data as any) {
      if (item.type === "file") {
        files.push(item)
      }

      if (item.type === "dir") {
        const nestedFiles: any = await findAllFilesRecursively(
          owner,
          repo,
          item.path,
        )
        files.push(...nestedFiles)
      }
    }
    return files
  } catch (error: unknown) {
    console.error("Error during recursive search:", error)
    return []
  }
}

export const getFilesContentsToml = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  const contents = await getFilesContentsBase64Decoded(owner, repo, paths)
  return contents.map((element) =>
    JSON.parse(JSON.stringify(toml.parse(element))),
  )
}

export const getFilesContentsJson = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  const contents = await getFilesContentsBase64Decoded(owner, repo, paths)
  return contents.map((element) => JSON.parse(element))
}

const getFilesContentsBase64Decoded = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  const contents = []

  for (let i = 0; i < paths.length; i++) {
    contents.push(await getFileContentBase64Decoded(owner, repo, paths[i]))
  }

  return contents
}

export const getFileContentBase64Decoded = async (
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
    return []
  }
}
