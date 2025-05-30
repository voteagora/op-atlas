import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { getUserById } from "@/db/users"
import {
  getCitizenByUserId,
  isQualifyingForS8Citizenship,
} from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"

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
  const result = await isQualifyingForS8Citizenship()

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto ">
        {result && result?.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold">
              You qualify for Season 8 Citizenship through:
            </div>
            {result.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                {item.type === CITIZEN_TYPES.user && (
                  <div className="text-secondary-foreground">
                    • Your address: {item.qualifyingAddress}
                  </div>
                )}
                {item.type === CITIZEN_TYPES.chain && (
                  <div className="text-secondary-foreground">
                    • Your organization: {item.qualifyingOrgId}
                  </div>
                )}
                {item.type === CITIZEN_TYPES.project && (
                  <div className="text-secondary-foreground">
                    • Your project: {item.qualifyingProjectId}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-lg font-semibold text-destructive">
            You do not qualify for Season 8 Citizenship
          </div>
        )}

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
