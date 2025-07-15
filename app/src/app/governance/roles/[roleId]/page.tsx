import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

import { AnalyticsTracker } from "@/app/governance/roles/[roleId]/components/AnalyticsTracker"
import { Sidebar } from "@/app/governance/roles/[roleId]/components/Sidebar"
import SidebarApplications from "@/app/governance/roles/[roleId]/components/SidebarApplications"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRoleApplications, getRoleById } from "@/db/role"
import { formatMMMd } from "@/lib/utils/date"
import { RoleDates } from "./components/RoleDates"

export default async function Page({ params }: { params: { roleId: string } }) {
  const role = await getRoleById(parseInt(params.roleId))
  const applications = await getRoleApplications(parseInt(params.roleId))

  if (!role) {
    notFound()
  }

  const voteSchedule =
    role?.voteStartAt && role?.voteEndAt
      ? `Vote ${formatMMMd(new Date(role.voteStartAt!))} - ${formatMMMd(
          new Date(role.voteEndAt!),
        )}`
      : null

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 max-w-[1064px] mx-auto px-4 lg:px-0 lg:flex lg:gap-12">
        <div className="w-full lg:w-[712px] lg:flex-shrink-0">
          <div className="flex flex-col w-full max-w-6xl z-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/governance">Governance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Role</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <AnalyticsTracker role={role} />

            <div className="flex flex-col gap-y-8 mt-12">
              <div className="flex flex-col gap-4">
                <div className="text-3xl font-semibold">{role.title}</div>
                {role.startAt && role.endAt && <RoleDates role={role} />}
              </div>

              <div className="border-b border-border-secondary w-full"></div>

              <div className="flex flex-col gap-6">
                <div className="text-secondary-foreground">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-6 last:mb-0">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-4xl font-semibold my-6">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-3xl font-semibold my-6">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-2xl text-semibold my-6">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xl text-semibold my-6">
                          {children}
                        </h4>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          className="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2">{children}</li>
                      ),
                    }}
                  >
                    {role.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full lg:w-[304px] lg:flex-shrink-0">
          <Sidebar role={role} />
          {applications && applications.length > 0 && (
            <SidebarApplications applications={applications} />
          )}
        </div>
      </div>
    </main>
  )
}
