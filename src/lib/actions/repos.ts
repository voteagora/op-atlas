"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addProjectRepository,
  removeProjectRepository,
  updateProjectRepositories,
} from "@/db/projects"

import { getFundingFile, getRepository } from "../github"
import { verifyMembership } from "./utils"

export const findRepo = async (owner: string, slug: string) => {
  const session = await auth()
  if (!session) {
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
  } catch (error: unknown) {
    console.error("Error searching for repo", (error as Error).message)
    return {
      error: "Error searching for repo",
    }
  }
}

const fetchFundingFile = async (owner: string, slug: string) => {
  try {
    const { data } = await getFundingFile(owner, slug)
    return Buffer.from((data as any).content ?? "", "base64").toString("utf-8")
  } catch (error: unknown) {
    // This will also happen if the file doesn't exist
    console.info("Error fetching funding file", (error as Error).message)
    return null
  }
}

const isValidFundingFile = (contents: string, projectId: string) => {
  try {
    const parsed = JSON.parse(contents)
    return parsed.opRetro && parsed.opRetro.projectId === projectId
  } catch (error) {
    return false
  }
}

export const verifyGithubRepo = async (
  projectId: string,
  owner: string,
  slug: string,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  try {
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

    const repo = await addProjectRepository({
      projectId,
      repo: {
        type: "github",
        url: `https://github.com/${owner}/${slug}`,
        verified: true,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      error: null,
      repo,
    }
  } catch (error) {
    console.error("Error creating repo", error)
    return {
      error: "Error creating repo",
    }
  }
}

export const removeGithubRepo = async (projectId: string, url: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  try {
    await removeProjectRepository({
      projectId,
      repositoryUrl: url,
    })

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
}

export const updatePackageRepos = async (projectId: string, urls: string[]) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  try {
    const repos = await updateProjectRepositories({
      projectId,
      type: "package",
      repositories: urls.map((url) => {
        return {
          url,
          type: "package",
          verified: false,
          projectId,
        }
      }),
    })

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
}
