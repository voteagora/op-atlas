"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  addProjectRepository,
  removeProjectRepository,
  updateProject,
  updateProjectLinks,
  updateProjectRepositories,
  updateProjectRepository,
} from "@/db/projects"
import { SessionContext, withImpersonation } from "@/lib/db/sessionContext"

import { getCrate } from "../crates"
import {
  getContents,
  getFileOrFolder,
  getFilesContentsToml,
  getLicense,
  getPackageJsonFiles,
  getRepository,
} from "../github"
import { isOpenSourceLicense } from "../licenses"
import { getNpmPackage } from "../npm"
import { verifyMembership } from "./utils"

type ProjectMemberContext = SessionContext & { userId: string }

async function withProjectMember<T>(
  projectId: string,
  handler: (ctx: ProjectMemberContext) => Promise<T>,
) {
  return withImpersonation(async (ctx) => {
    if (!ctx.userId) {
      return {
        error: "Unauthorized",
      } as T
    }

    const membership = await verifyMembership(projectId, ctx.userId, ctx.db)
    if (membership?.error) {
      return membership as T
    }

    return handler({ ...ctx, userId: ctx.userId })
  }, { requireUser: true })
}

export const findRepo = async (owner: string, slug: string) =>
  withImpersonation(
    async ({ userId }) => {
      if (!userId) {
        return {
          error: "Not authenticated",
        }
      }

      try {
        const repo = await getRepository(owner, slug)
        if (repo) {
          return {
            error: null,
            repo: repo ?? null,
          }
        }
        return { error: null, repo: null }
      } catch (error: unknown) {
        console.error("Error searching for repo", (error as Error).message)
        return {
          error: "Error searching for repo",
        }
      }
    },
    { requireUser: true },
  )

const fetchFundingFile = async (owner: string, slug: string) => {
  try {
    const rootContents = await getContents(owner, slug, 1)

    if (rootContents && Array.isArray(rootContents)) {
      const validNames = new Set(["funding.json"])

      for (const file of rootContents) {
        const normalizedFileName = file.name.trim().toLowerCase()

        if (validNames.has(normalizedFileName)) {
          try {
            const { data } = await getFileOrFolder(owner, slug, file.name, 1)
            const content = Buffer.from(
              (data as any).content ?? "",
              "base64",
            ).toString("utf-8")
            return content
          } catch (error: unknown) {
            console.info(
              `Error fetching funding file "${file.name}" from ${owner}/${slug}:`,
              error,
            )
            continue
          }
        }
      }
    }
  } catch (error: unknown) {
    console.info(`Error getting root contents from ${owner}/${slug}:`, error)
  }

  return null
}

const isValidFundingFile = (contents: string, projectId: string) => {
  try {
    const parsed = JSON.parse(contents)
    return parsed.opRetro && parsed.opRetro.projectId === projectId
  } catch (error) {
    return false
  }
}

const getFilesByName = (files: any[], name: string) => {
  return files.filter((element: any) => {
    return element?.name.toLowerCase() === name
  })
}

const verifyCrate = async (owner: string, slug: string, files: any[]) => {
  const cargoTomls = getFilesByName(files, "cargo.toml")
  const contents = await getFilesContentsToml(
    owner,
    slug,
    cargoTomls.map((item) => item.path),
  )

  const crates = await Promise.all(
    contents.map((content) => getCrate(content?.package?.name)),
  )

  return crates.some((crate) => {
    return (
      crate &&
      !crate.errors &&
      verifyOwnerAndSlug(
        owner,
        slug,
        crate.crate.repository?.split("/").filter(Boolean),
      )
    )
  })
}

const verifyNpm = async (owner: string, slug: string, rootFiles: any[]) => {
  const rootLevelPackageJson = getFilesByName(rootFiles, "package.json")
  // If no package.json on the root, this is not an npm monorepo
  if (rootLevelPackageJson.length === 0) {
    return false
  }

  const packageJsons = await getPackageJsonFiles(
    owner,
    slug,
    rootLevelPackageJson,
  )

  const packages = await Promise.all(
    packageJsons
      .filter(
        (
          packageJson,
        ): packageJson is { path: string; content: { name: string } } =>
          packageJson.content.hasOwnProperty("name"),
      )
      .map((packageJson) => getNpmPackage(packageJson.content.name)),
  )

  return packages.some(
    (pkg) =>
      pkg &&
      pkg.error !== "Not found" &&
      verifyOwnerAndSlug(
        owner,
        slug,
        pkg.repository?.url?.split("/").filter(Boolean),
      ),
  )
}

const verifyOwnerAndSlug = (
  owner: string,
  slug: string,
  pathParts: string[],
) => {
  const ownerResult = pathParts?.some((part) => owner === part)
  const slugResult = pathParts?.some(
    (part) => slug === part.replace(".git", ""),
  )

  return ownerResult && slugResult
}

export const verifyGithubRepo = async (
  projectId: string,
  owner: string,
  slug: string,
) => {
  const funding = await fetchFundingFile(owner, slug)
  if (!funding) {
    return {
      error: "No funding file found",
    }
  }

  const isValid = isValidFundingFile(funding, projectId)
  if (!isValid) {
    return {
      error: "Invalid funding file",
    }
  }

  const repoFiles = await getContents(owner, slug)

  const [isCrate, isNpmPackage, license] = await Promise.all([
    verifyCrate(owner, slug, repoFiles),
    verifyNpm(owner, slug, repoFiles),
    getLicense(owner, slug),
  ])

  console.log("repoFiles", isCrate, isNpmPackage, license)

  return {
    repo: {
      isOpenSource: license && isOpenSourceLicense(license),
      isNpmPackage,
      isCrate,
    },
  }
}

export const createGithubRepo = async (
  projectId: string,
  owner: string,
  slug: string,
  name?: string,
  description?: string,
) =>
  withProjectMember(projectId, async ({ db }) => {
    const verification = await verifyGithubRepo(projectId, owner, slug)
    if (verification.error) return { error: verification.error }

    try {
      const repo = await addProjectRepository(
        {
          projectId,
          repo: {
            type: "github",
            url: `https://github.com/${owner}/${slug}`,
            verified: true,
            openSource: !!verification.repo?.isOpenSource,
            npmPackage: !!verification.repo?.isNpmPackage,
            crate: !!verification.repo?.isCrate,
            name,
            description,
          },
        },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        error: null,
        repo,
      }
    } catch (error: unknown) {
      console.error("Error creating repo", error)
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint failed on the fields: (`url`)")
      ) {
        return {
          error: "Repo already exists",
        }
      }

      return {
        error: "Error creating repo",
      }
    }
  })

// Only allows very limited property updates
export const updateGithubRepo = async (
  projectId: string,
  url: string,
  updates: { containsContracts: boolean; name?: string; description?: string },
) =>
  withProjectMember(projectId, async ({ db }) => {
    try {
      const repo = await updateProjectRepository(
        {
          projectId,
          url,
          updates,
        },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        error: null,
        repo,
      }
    } catch (error) {
      console.error("Error updating repo", error)
      return {
        error: "Error updating repo",
      }
    }
  })

// Update multiple repo update
export const updateGithubRepos = async (
  projectId: string,
  noRepos: boolean,
  repos: {
    url: string
    updates: {
      containsContracts?: boolean
      name?: string
      description?: string
    }
  }[],
) =>
  withProjectMember(projectId, async ({ db, session }) => {
    try {
      const projectUpdate = updateProject(
        {
          id: projectId,
          project: {
            hasCodeRepositories: !noRepos,
          },
        },
        { db, session },
      )

      const repoUpdates = Promise.all(
        repos.map((repo) =>
          updateProjectRepository(
            {
              projectId,
              url: repo.url,
              updates: {
                containsContracts: repo.updates.containsContracts,
                name: repo.updates.name,
                description: repo.updates.description,
              },
            },
            db,
          ),
        ),
      )

      const [, updatedRepos] = await Promise.all([projectUpdate, repoUpdates])

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        error: null,
        repos: updatedRepos,
      }
    } catch (error) {
      console.error("Error updating repos", error)
      return {
        error: "Error updating repos",
      }
    }
  })

export const removeGithubRepo = async (projectId: string, url: string) =>
  withProjectMember(projectId, async ({ db }) => {
    try {
      await removeProjectRepository(
        {
          projectId,
          repositoryUrl: url,
        },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        success: true,
        error: null,
      }
    } catch (error) {
      console.error("Error removing repo", error)
      return {
        error: "Error removing repo",
      }
    }
  })

export const updatePackageRepos = async (
  projectId: string,
  urls: string[],
) =>
  withProjectMember(projectId, async ({ db }) => {
    try {
      const repos = await updateProjectRepositories(
        {
          projectId,
          type: "package",
          repositories: urls.map((url) => ({
            url,
            type: "package",
            verified: false,
            projectId,
          })),
        },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        error: null,
        repos,
      }
    } catch (error) {
      console.error("Error updating packages", error)
      return {
        error: "Error updating packages",
      }
    }
  })

export const setProjectLinks = async (
  projectId: string,
  links: Prisma.ProjectLinksCreateManyInput[],
) =>
  withProjectMember(projectId, async ({ db }) => {
    await updateProjectLinks({ projectId, links }, db)

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return { error: null }
  })
