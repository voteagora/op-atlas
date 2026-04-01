import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"
import { Octokit } from "octokit"

const REVALIDATE_SECONDS = 60 * 60
const FOUNDATION_MISSIONS_ORG = "ethereum-optimism"
const FOUNDATION_MISSIONS_PROJECT_NUMBER = 31

export const revalidate = REVALIDATE_SECONDS

const getGitHubProjectsToken = () =>
  process.env.GITHUB_PROJECTS_API_KEY || process.env.GITHUB_AUTH_TOKEN

const isGitHubAuthError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false
  }

  const status = (error as { status?: number }).status
  return status === 401 || status === 403
}

const fetchAllProjectItems = async (
  octokit: Octokit,
  org: string,
  projectNumber: number,
) => {
  const allItems: any[] = []
  let hasNextPage = true
  let cursor: string | null = null

  while (hasNextPage) {
    const projectQuery = `
      query($org: String!, $projectNumber: Int!, $after: String) {
        organization(login: $org) {
          projectV2(number: $projectNumber) {
            id
            title
            items(first: 100, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                  }
                }
                content {
                  ... on Issue {
                    id
                    number
                    title
                    state
                    url
                    labels(first: 10) {
                      nodes {
                        name
                        color
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables: Record<string, string | number | null> = {
      org,
      projectNumber,
    }

    if (cursor) {
      variables.after = cursor
    }

    const response: any = await octokit.graphql(projectQuery, variables)
    const projectData = response.organization?.projectV2

    if (!projectData) {
      throw new Error("Project not found")
    }

    allItems.push(...projectData.items.nodes)
    hasNextPage = projectData.items.pageInfo.hasNextPage
    cursor = projectData.items.pageInfo.endCursor
  }

  return allItems
}

const getGitHubProjectMissions = unstable_cache(
  async () => {
    const token = getGitHubProjectsToken()

    if (!token) {
      return []
    }

    const octokit = new Octokit({ auth: token })

    try {
      const allItems = await fetchAllProjectItems(
        octokit,
        FOUNDATION_MISSIONS_ORG,
        FOUNDATION_MISSIONS_PROJECT_NUMBER,
      )

      return allItems
        .filter((item: any) => {
          if (!item.content) return false

          const labels = item.content.labels?.nodes || []
          return labels.some((label: any) =>
            label.name.toLowerCase().includes("foundation mission request"),
          )
        })
        .map((item: any) => {
          const content = item.content
          const statusField = item.fieldValues.nodes.find((field: any) =>
            field.field?.name?.toLowerCase().includes("status"),
          )

          return {
            id: parseInt(content.id),
            title: content.title,
            state: content.state.toLowerCase() as "open" | "closed",
            column: statusField?.name,
            labels:
              content.labels?.nodes.map((label: any) => ({
                name: label.name,
              })) || [],
          }
        })
    } catch (error) {
      if (!isGitHubAuthError(error)) {
        console.error("Error fetching GitHub project missions:", error)
      }
      return []
    }
  },
  ["github-project-missions"],
  { revalidate: REVALIDATE_SECONDS },
)

export async function GET() {
  const missions = await getGitHubProjectMissions()
  return NextResponse.json(missions)
}
