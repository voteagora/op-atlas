import PublicOrganizationProfile from "@/components/organizations/public/PublicOrganizationProfile"
import PublicUserProfile from "@/components/profile/public/PublicProfile"
import {
  getOrganizations,
  getOrganizationWithDetails,
} from "@/db/organizations"
import { getUserByUsername } from "@/db/users"
import { getUser as getGithubUser } from "@/lib/actions/github"
import { getAllPublishedProjects } from "@/lib/actions/projects"
// import { getUser } from "@/lib/github"

export default async function PublicProfile({
  params,
}: {
  params: { id: string }
}) {
  if (params.id.startsWith("0x")) {
    const organization = await getOrganizationWithDetails({ id: params.id })

    if (!organization) {
      return <div>Organization not found</div>
    }

    return <PublicOrganizationProfile organization={organization} />
  }

  const user = await getUserByUsername(params.id)

  if (!user) {
    return <div>User not found</div>
  }

  const [organizations, projects] = await Promise.all([
    getOrganizations(user.id),
    getAllPublishedProjects(user.id),
  ])

  user.github = "jacobhomanics"
  const githubUserDataResult = await getGithubUser(user.github)

  // console.log(githubUserData.name)

  console.log(githubUserDataResult?.user)
  return (
    <PublicUserProfile
      user={user}
      githubUserData={githubUserDataResult?.user}
      // userGithubData={githubUserData}
      organizations={
        organizations?.organizations.map(({ organization }) => organization) ||
        []
      }
      projects={projects}
    />
  )
}
