import { NextResponse } from "next/server"
import { Octokit } from "octokit"

export const revalidate = 60 * 60

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
})

export async function GET() {
  try {
    // Fetch all project items with pagination
    const fetchAllProjectItems = async (org: string, projectNumber: number) => {
      let allItems: any[] = []
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

        const variables: any = {
          org,
          projectNumber
        }
        
        if (cursor) {
          variables.after = cursor
        }

        const response: any = await octokit.graphql(projectQuery, variables)
        const projectData = response.organization?.projectV2

        if (!projectData) {
          throw new Error("Project not found")
        }

        allItems = allItems.concat(projectData.items.nodes)
        hasNextPage = projectData.items.pageInfo.hasNextPage
        cursor = projectData.items.pageInfo.endCursor
      }

      return allItems
    }

    const allItems = await fetchAllProjectItems("ethereum-optimism", 31)

    const missions = allItems
      .filter((item: any) => {
        // Only items with content (issues) AND Foundation Mission Request label
        if (!item.content) return false
        
        const labels = item.content.labels?.nodes || []
        return labels.some((label: any) => 
          label.name.toLowerCase().includes('foundation mission request')
        )
      })
      .map((item: any) => {
        const content = item.content
        
        // Find the Status field value (actual project board column)
        const statusField = item.fieldValues.nodes.find((field: any) => 
          field.field?.name?.toLowerCase().includes('status')
        )
        
        let column = statusField?.name
        
        return {
          id: parseInt(content.id),
          title: content.title,
          state: content.state.toLowerCase() as "open" | "closed",
          column: column,
          labels: content.labels?.nodes.map((label: any) => ({
            name: label.name,
          })) || [],
        }
      })

    return NextResponse.json(missions)
  } catch (error) {
    console.error('Error fetching GitHub project missions:', error)
    
    return NextResponse.json([])
  }
}