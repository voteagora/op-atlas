import PublicUserProfile from "@/components/profile/public/PublicProfile"
import { getOrganization, getOrganizations } from "@/db/organizations"
import { getUserByUsername } from "@/db/users"
import { getProjects } from "@/lib/actions/projects"

export default async function PublicProfile({
  params,
}: {
  params: { id: string }
}) {
  if (params.id.startsWith("0x")) {
    const organization = await getOrganization({ id: params.id })

    if (!organization) {
      return <div>Organization not found</div>
    }

    return <div>{JSON.stringify(organization)}</div>
  }

  const user = await getUserByUsername(params.id)

  if (!user) {
    return <div>User not found</div>
  }

  const [organizations, projects] = await Promise.all([
    getOrganizations(user.id),
    getProjects(user.id),
  ])

  return (
    <PublicUserProfile
      user={user}
      organizations={
        organizations?.organizations.map(({ organization }) => organization) ||
        []
      }
      projects={projects}
    />
  )
}
