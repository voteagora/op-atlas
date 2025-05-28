import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Citizenship Registration",
  description: "Register for Citizenship in the Optimism Collective.",
  openGraph: {
    ...sharedMetadata.openGraph,
    title: "Citizenship Registration",
    description: "Register for Citizenship in the Optimism Collective.",
  },
}

export default async function Page() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0 lg:grid lg:grid-cols-3 lg:gap-x-16">
        <div className="lg:col-span-2 lg:mt-0">
          <div className="flex flex-col w-full  z-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Citizenship Registration</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col gap-y-8 mt-12">
              <div className="text-3xl font-semibold">
                Citizenship Registration
              </div>
              <div className="border-b border-border-secondary w-full"></div>
              <div className="text-secondary-foreground">
                <div className="flex flex-col gap-y-4">
                  <Link
                    href="/citizenship/individual"
                    className="hover:underline"
                  >
                    Apply as Inidividual
                  </Link>
                  <Link href="/citizenship/project" className="hover:underline">
                    Apply as Project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
