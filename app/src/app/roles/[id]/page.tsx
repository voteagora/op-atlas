import { notFound } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { prisma } from "@/db/client"

import { RoleDetails } from "./components/RoleDetails"
import { RoleSidebar } from "./components/RoleSidebar"

export default async function Page({ params }: { params: { id: string } }) {
  const role = await prisma.role.findUnique({
    where: {
      id: parseInt(params.id),
    },
  })

  if (!role) {
    notFound()
  }

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

            <RoleDetails role={role} />
          </div>
        </div>
        <div>
          <RoleSidebar role={role} />
        </div>
      </div>
    </main>
  )
}
