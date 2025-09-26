import { notFound, redirect } from "next/navigation"

import { AnalyticsTracker } from "@/app/governance/roles/[roleId]/apply/components/AnalyticsTracker"
import { Form } from "@/app/governance/roles/[roleId]/apply/components/Form"
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

export const metadata = {
  title: "Governance - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page({ params }: { params: { roleId: string } }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return redirect(`/governance/roles/${params.roleId}`)
  }

  const [role, user, userOrgs] = await Promise.all([
    getRoleById(parseInt(params.roleId)),
    getUserById(userId),
    getUserOrganizations(userId),
  ])

  if (!role || !user || !userOrgs) {
    return notFound()
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 max-w-[712px] lg:mx-auto lg:px-0">
        <div className="flex flex-col w-full max-w-[712px] z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/governance">Governance</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/governance/roles/${params.roleId}`}>
                  Role
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Apply</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <AnalyticsTracker role={role} />

          <div className="flex flex-col gap-y-4 mt-12">
            <div className="flex flex-col gap-4">
              <div className="text-3xl font-semibold">{`Self-nominate for ${role.title}`}</div>
              {role.startAt && role.endAt && (
                <div className="text-muted-foreground flex flex-row gap-2">
                  <div>
                    Submit this application by{" "}
                    {formatMMMd(new Date(role.endAt))}
                  </div>
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
