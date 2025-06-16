"use server"

import Link from "next/link"
import { redirect } from "next/navigation"

import { ActiveCitizen } from "@/app/citizenship/components/ActiveCitizen"
import { ChainAppRequirements } from "@/app/citizenship/components/ChainAppRequirements"
import { Sidebar } from "@/app/citizenship/components/Sidebar"
import { UserRequirements } from "@/app/citizenship/components/UserRequirements"
import { auth } from "@/auth"
import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getUserById } from "@/db/users"
import {
  checkCitizenshipLimit,
  getCitizen,
  s8CitizenshipQualification,
} from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"

import { AnalyticsTracker } from "./components/AnalyticsTracker"

export default async function Page() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const [user, citizen, qualification, isCitizenshipLimitReached] =
    await Promise.all([
      getUserById(userId),
      getCitizen({ type: CITIZEN_TYPES.user, id: userId }),
      s8CitizenshipQualification(),
      checkCitizenshipLimit(),
    ])

  if (!user) {
    redirect("/")
  }

  // Existing citizen
  if (citizen?.attestationId) {
    return (
      <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
        <div className="w-full mt-20 ">
          <ActiveCitizen user={user} />
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0 lg:grid lg:grid-cols-3 lg:gap-x-16">
        <div className="lg:col-span-2 lg:mt-0">
          <div className="flex flex-col w-full max-w-6xl z-10">
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

            <AnalyticsTracker qualification={qualification} />

            <div className="flex flex-col gap-y-8 mt-12">
              <div className="text-[36px] font-semibold text-foreground">
                Citizenship Registration
              </div>
              <div className="border-b border-border-secondary w-full"></div>
              <div className="text-secondary-foreground">
                <div className="flex flex-col gap-y-6">
                  <div>
                    The Citizens&apos; House votes on decisions that shape the
                    direction of the Collective.
                  </div>
                  <div>Season 8 Citizens will:</div>
                  <ul className="list-disc list-inside">
                    <li>
                      Elect the{" "}
                      <span className="font-semibold">
                        Developer Advisory Board
                      </span>
                      , tasked with reviewing{" "}
                      <span className="font-semibold">Protocol Upgrades</span>
                    </li>
                    <li>
                      Have the opportunity to
                      <span className="font-semibold"> override </span>
                      Protocol Upgrades
                    </li>
                    <li>
                      Approve the{" "}
                      <span className="font-semibold">Collective Intent</span>{" "}
                      as well as{" "}
                      <span className="font-semibold">
                        Retroactive Public Goods Funding mission budgets
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                {qualification?.type !== CITIZEN_TYPES.user && qualification ? (
                  <ChainAppRequirements
                    userId={userId}
                    qualification={qualification}
                  />
                ) : (
                  <UserRequirements
                    userId={userId}
                    qualification={qualification}
                  />
                )}
              </div>

              <div className="border-b border-border-secondary w-full"></div>
              <div className="text-secondary-foreground">
                Learn more about citizenship in{" "}
                <Link
                  href="https://community.optimism.io/citizens-house/citizen-house-overview"
                  target="_blank"
                  className="underline"
                >
                  Gov Docs: Citizens House
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          {qualification && (
            <div>
              {qualification.type !== CITIZEN_TYPES.user ? (
                <Sidebar user={user} qualification={qualification} />
              ) : (
                <div>
                  {isCitizenshipLimitReached ? (
                    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
                      <UserAvatarLarge imageUrl={user?.imageUrl} />

                      <div className="flex flex-col gap-2">
                        <div className="font-semibold text-secondary-foreground">
                          Registration has closed
                        </div>
                        <div className="text-sm text-secondary-foreground">
                          Thanks for your interest, but the Citizens&apos; House
                          has reached it&apos;s maximum capacity.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Sidebar user={user} qualification={qualification} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
