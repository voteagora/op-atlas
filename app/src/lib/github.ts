import { unstable_cache } from "next/cache"
import { Octokit } from "octokit"
import toml from "toml"

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
})

async function cacheGitHubData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 3600,
): Promise<T> {
  return unstable_cache(fetchFn, [key], { revalidate: ttl })()
}

export async function getRepository(owner: string, slug: string) {
  return cacheGitHubData(`repo:${owner}:${slug}`, async () => {
    return await octokit.rest.repos.get({ owner, repo: slug })
  })
}

export async function getFileOrFolder(
  owner: string,
  slug: string,
  path: string,
  ttl?: number,
) {
  return cacheGitHubData(
    `file:${owner}:${slug}:${path}`,
    async () => {
      return await octokit.rest.repos.getContent({ owner, repo: slug, path })
    },
    ttl,
  )
}

// Fetch the SPDX license ID for a repository
export async function getLicense(owner: string, slug: string) {
  return cacheGitHubData(`license:${owner}:${slug}`, async () => {
    try {
      const result = await octokit.request(
        "GET /repos/{owner}/{repo}/license",
        {
          owner,
          repo: slug,
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        },
      )
      return result.data.license?.spdx_id
    } catch (error) {
      return null
    }
  })
}

export const getContents = async (
  owner: string,
  slug: string,
  ttl?: number,
) => {
  return cacheGitHubData(
    `contents:${owner}:${slug}`,
    async () => {
      try {
        const result = await octokit.request(
          "GET /repos/{owner}/{repo}/contents",
          {
            owner,
            repo: slug,
            headers: { "X-GitHub-Api-Version": "2022-11-28" },
          },
        )
        return result.data
      } catch (error) {
        return null
      }
    },
    ttl,
  )
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

export async function getPackageJsonFiles(
  owner: string,
  slug: string,
  files: any[] = [],
  path = "",
  level = 0,
): Promise<{ path: string; content: object }[]> {
  let packageFiles: { path: string; content: object }[] = []

  for (const item of files) {
    if (item.type === "file" && item.name === "package.json") {
      const content = await processPackageJson(owner, slug, item.path)
      if (content) {
        packageFiles.push({ path: item.path, content })
      }
      // Only traverse 2 levels deep
    } else if (item.type === "dir" && level < 3) {
      const subContents = await getContentsFromPath(owner, slug, item.path)

      const subFiles = await getPackageJsonFiles(
        owner,
        slug,
        subContents,
        path + item.path + "/",
        level + 1,
      )
      packageFiles = packageFiles.concat(subFiles)
    }
  }

  return packageFiles
}

async function getContentsFromPath(owner: string, slug: string, path: string) {
  return cacheGitHubData(`contents:${owner}:${slug}:${path}`, async () => {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        path,
        repo: slug,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      },
    )

    const contents = response.data ?? []

    if (!Array.isArray(contents)) {
      return []
    }

    return contents
  })
}

async function processPackageJson(owner: string, slug: string, path: string) {
  const content = await getFileContentBase64Decoded(owner, slug, path)

  try {
    const parsedContent = content ? JSON.parse(content) : null
    if (parsedContent && typeof parsedContent === "object") {
      return parsedContent
    }
  } catch (err) {
    console.error("Error parsing package.json:", err)
  }
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
  return cacheGitHubData(`file_toml:${owner}:${repo}:${path}`, async () => {
    const base64Decoded = await getFileContentBase64Decoded(owner, repo, path)
    if (!base64Decoded) return null

    try {
      return toml.parse(base64Decoded)
    } catch (error) {
      console.error("Error parsing TOML file:", error)
      return null
    }
  })
}

const getFileContentJson = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  return cacheGitHubData(`file_json:${owner}:${repo}:${path}`, async () => {
    const base64Decoded = await getFileContentBase64Decoded(owner, repo, path)
    if (!base64Decoded) return null

    try {
      return JSON.parse(base64Decoded)
    } catch (error) {
      return null
    }
  })
}

const getFileContentBase64Decoded = async (
  owner: string,
  repo: string,
  path: string = "",
) => {
  return cacheGitHubData(`file_base64:${owner}:${repo}:${path}`, async () => {
    try {
      const response = await getFileOrFolder(owner, repo, path)
      if ((response.data as any).encoding === "base64") {
        return Buffer.from((response.data as any).content, "base64").toString(
          "utf-8",
        )
      }
    } catch (error) {
      console.error("Error getting file contents:", error)
      return null
    }
  })
}
