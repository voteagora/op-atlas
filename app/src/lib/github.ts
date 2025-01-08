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

    const content = Buffer.from(result.data.content, "base64").toString("utf-8")
    const json = JSON.parse(content)

    return json
  } catch (error: unknown) {
    return null
  }
}

export async function getCargoToml(owner: string, slug: string) {
  try {
    const result = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/cargo.toml",
      {
        owner,
        repo: slug,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    )

    const content = Buffer.from(result.data.content, "base64").toString("utf-8")
    const json = JSON.parse(JSON.stringify(toml.parse(content)))

    return json
  } catch (error: unknown) {
    console.log(error)
    return null
  }
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

export const getFilesContents = async (
  owner: string,
  repo: string,
  paths: string[],
) => {
  const contents = []

  for (let i = 0; i < paths.length; i++) {
    contents.push(await getFileContents(owner, repo, paths[i]))
  }

  return contents
}

export const getFileContents = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  try {
    const response = await getFileOrFolder(owner, repo, path)
    if ((response.data as any).encoding === "base64") {
      const content = JSON.parse(
        Buffer.from((response.data as any).content, "base64").toString("utf-8"),
      )
      return content
    }
  } catch (error: unknown) {
    console.error("Error getting file contents:", error)
    return []
  }
}
