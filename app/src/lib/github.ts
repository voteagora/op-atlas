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

export async function getNpmPackage(name: string) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`
  const response = await fetch(url)
  const npmPackage = await response.json()
  return npmPackage
}

function getCrateUrl(crateName: string): string {
  //Option 1:
  return `https://crates.io/api/v1/crates/${encodeURIComponent(crateName)}`

  //OPTION 2 (Crate's suggested method. However believed to be updated infrequently):
  // const part1 = crateName[0]
  // const part2 = crateName.length > 1 ? crateName[1] : "_"
  // return `https://index.crates.io/${part1}/${part2}/${crateName}`
}

export async function getCrate(name: string) {
  const url = getCrateUrl(name)
  const response = await fetch(url, {
    headers: {
      "User-Agent": "OP Atlas (jake@voteagora.com)",
    },
  })

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
