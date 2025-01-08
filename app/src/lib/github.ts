import { Octokit } from "octokit"
import toml from "toml"

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

const findFilesWithContentRecursively = async (
  owner: string,
  repo: string,
  path: string = "",
  results: any[] = [],
) => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
      },
    )

    for (const item of response.data as any) {
      if (item.type === "file" && item.name === "package.json") {
        console.log(`Found package.json at: ${item.path}`)
        // Fetch file content
        const fileResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/contents/{path}",
          {
            owner,
            repo,
            path: item.path,
          },
        )

        if ((fileResponse.data as any).encoding === "base64") {
          const content = JSON.parse(
            Buffer.from((fileResponse.data as any).content, "base64").toString(
              "utf-8",
            ),
          )
          results.push({ path: item.path, content }) // Store path and decoded content
        }
      }

      if (item.type === "dir") {
        await findFilesWithContentRecursively(owner, repo, item.path, results) // Recurse into directories
      }
    }
  } catch (error: unknown) {
    console.error("Error during recursive search:", error)
  }
  return results // Return the accumulated results
}

export const searchAllPackageJson = async (owner: string, repo: string) => {
  const results = await findFilesWithContentRecursively(owner, repo)
  if (results.length === 0) {
    console.log("No package.json files found in the repository.")
  } else {
    console.log("Found package.json files at the following locations:")
    console.log(results)
  }
  return results
}
