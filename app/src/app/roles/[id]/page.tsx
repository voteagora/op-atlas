import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRoleById } from "@/db/role"
import { formatMMMd } from "@/lib/utils/date"

import { Sidebar } from "./components/Sidebar"

export default async function Page({ params }: { params: { id: string } }) {
  const role = await getRoleById(parseInt(params.id))

  if (!role) {
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
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0 lg:grid lg:grid-cols-3 lg:gap-x-16">
        <div className="lg:col-span-2 lg:mt-0">
          <div className="flex flex-col w-full max-w-6xl z-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/roles">Roles</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{role.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-y-8 mt-12">
              <div className="flex flex-col gap-4">
                <div className="text-3xl font-semibold">{role.title}</div>
                {role.startAt && role.endAt && (
                  <div className="text-muted-foreground flex flex-row gap-4">
                    <div>
                      Nominations {formatMMMd(new Date(role.startAt))} -{" "}
                      {formatMMMd(new Date(role.endAt))}
                    </div>
                    {voteSchedule}
                  </div>
                )}
              </div>

              <div className="border-b border-border-secondary w-full"></div>

              <div className="flex flex-col gap-6">
                <div className="text-secondary-foreground">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-6 last:mb-0">{children}</p>
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
                    }}
                  >
                    {role.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Sidebar role={role} />
        </div>
      </div>
    </main>
  )
}
