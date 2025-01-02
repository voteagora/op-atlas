import { useQuery } from "@tanstack/react-query"

type GithubUser = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  user_view_type: string
  site_admin: boolean
  name: string
  company: string
  blog: string
  location: string
  email: string
  hireable: boolean
  bio: string
  twitter_username: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string // ISO8601 date string
  updated_at: string // ISO8601 date string
  private_gists: number
  total_private_repos: number
  owned_private_repos: number
  disk_usage: number
  collaborators: number
  two_factor_authentication: boolean
  plan: {
    name: string
    space: number
    collaborators: number
    private_repos: number
  }
}

const fetchData = async (username: string): Promise<GithubUser> => {
  const response = await fetch(`/api/github/user/${username}`)
  const json = await response.json()
  return json
}

export const useGithubUserData = (username: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["github-user"],
    queryFn: async (): Promise<GithubUser> => {
      return fetchData(username)
    },
  })

  return { user: data, isLoading, error }
}
