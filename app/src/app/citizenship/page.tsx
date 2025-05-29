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
import { getUserById } from "@/db/users"
import { getCitizenByUserId } from "@/lib/actions/citizens"

import { CitizenshipSuccess } from "./individual/components/CitizenshipSuccess"

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

  const user = await getUserById(userId)
  const citizen = await getCitizenByUserId(userId)

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto ">
        {citizen?.attestationId && <CitizenshipSuccess user={user} />}

        <div className="flex flex-col gap-y-8 mt-12">
          <div className="text-secondary-foreground border border-red-500">
            <div className="flex flex-col gap-y-4">
              <div className="text-sm text-red-500">
                TEST ONLY - REMOVE AFTER QA
              </div>
              <Link href="/citizenship/individual" className="hover:underline">
                Apply as Inidividual
              </Link>
              <Link href="/citizenship/project" className="hover:underline">
                Apply as Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
