import { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenshipEligibility } from "@/app/citizenship/enroll/components/CitizenshipEligibility"
import { CitizenshipRegistrationSidebar } from "@/app/citizenship/enroll/components/CitizenshipRegistrationSidebar"
import { CitizenshipRequirements } from "@/app/citizenship/enroll/components/CitizenshipRequirements"
import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getUserById } from "@/db/users"
import Link from "next/link"



export const metadata: Metadata = {
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

    if (!user) {
        redirect("/")
    }

    return <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
        <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0 lg:grid lg:grid-cols-3 lg:gap-x-16">

            <div className="lg:col-span-2 lg:mt-0">
                <div className="flex flex-col w-full max-w-6xl z-10">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Citizenship Enrollment</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex flex-col gap-y-8 mt-12">
                        <div className="flex flex-col gap-2">
                            <div className="text-3xl font-semibold">Citizenship Enrollment</div>
                            <div className="text-sm text-secondary-foreground">[Start Date] - [End Date]</div>
                        </div>
                        <div className="border-b border-border-secondary w-full"></div>
                        <div className="flex flex-col gap-y-12 text-secondary-foreground">
                            <div className="flex flex-col gap-y-6">
                                <div>The Citizens&apos; House votes on decisions that shape the direction of the Collective.</div>
                                <div>Season 8 Citizens will:</div>
                                <ul className="list-disc list-inside">
                                    <li>Elect the Developer <span className="font-semibold">Advisory Board</span>, tasked with reviewing <span className="font-semibold">Protocol Upgrades</span></li>
                                    <li>Have the opportunity to <span className="font-semibold">override Protocol Upgrades</span></li>
                                    <li>Approve the <span className="font-semibold">Collective Intent</span>, as well as <span className="font-semibold">Retroactive Public Goods Funding mission budgets</span></li>
                                </ul>
                            </div>
                            <CitizenshipEligibility />
                            <CitizenshipRequirements userId={userId} />
                        </div>
                        <div className="border-b border-border-secondary w-full"></div>
                        <div>Learn more about citizenship in <Link href="https://community.optimism.io/citizens-house/citizen-house-overview" target="_blank" className="underline">Gov Docs: Citizens House</Link></div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 mt-12 lg:mt-0">
                <CitizenshipRegistrationSidebar user={user} />
            </div>
        </div>
    </main>
}
