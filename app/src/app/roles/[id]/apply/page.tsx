import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRoleById } from "@/db/role"
import { getUserById } from "@/db/users"
import { getUserOrganizations } from "@/lib/actions/organizations"
import { formatMMMd } from "@/lib/utils/date"

import { Form } from "./components/Form"

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(`/roles/${params.id}`)
  }

  const [role, user, userOrgs] = await Promise.all([
    getRoleById(parseInt(params.id)),
    getUserById(userId),
    getUserOrganizations(userId),
  ])

  if (!role || !user || !userOrgs) {
    notFound()
  }

  const voteSchedule =
    role?.voteStartAt && role?.voteEndAt
      ? ` | Vote ${formatMMMd(new Date(role.voteStartAt!))} - ${formatMMMd(
          new Date(role.voteEndAt!),
        )}`
      : ""

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0">
        <div className="flex flex-col w-full max-w-6xl z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/roles">Roles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/roles/${params.id}`}>
                  {role.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Apply</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-y-8 mt-12">
            <div className="flex flex-col gap-4">
              <div className="text-3xl font-semibold">{role.title}</div>
              {role.startAt && role.endAt && (
                <div className="text-muted-foreground flex flex-row gap-4">
                  <div>
                    Submit your application between{" "}
                    {formatMMMd(new Date(role.startAt))}
                    {" - "}
                    {formatMMMd(new Date(role.endAt))}
                  </div>
                  {voteSchedule}
                </div>
              )}
            </div>
            <div className="border-b border-border-secondary w-full"></div>
            <Form role={role} user={user} userOrgs={userOrgs} />
          </div>
        </div>
      </div>
    </main>
  )
}
