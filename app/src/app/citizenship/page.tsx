import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/common/Button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getUserById } from "@/db/users"

import { sharedMetadata } from "../shared-metadata"

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
                        <div className="flex flex-col gap-y-8 mt-12">
                            <div className="text-3xl font-semibold">
                                Citizenship Registration
                            </div>
                            <div className="border-b border-border-secondary w-full"></div>
                            <div className="text-secondary-foreground">
                                <div className="flex flex-col gap-y-6">
                                    <div>
                                        As a Citizen, your project will help guide the future of the
                                        Superchain. The Citizens&apos; House votes on decisions that
                                        shape the technology, funding, and direction of the
                                        Collective.
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
                                            Have the opportunity to{" "}
                                            <span className="font-semibold">
                                                veto Protocol Upgrades
                                            </span>
                                        </li>
                                        <li>
                                            Approve the{" "}
                                            <span className="font-semibold">Collective Intent</span>,
                                            as well as{" "}
                                            <span className="font-semibold">
                                                Retro Funding Missions
                                            </span>{" "}
                                            and their <span className="font-semibold">budgets</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="text-2xl font-semibold mt-12">Requirements</div>
                                <ul className="list-disc list-inside mt-6">
                                    <li>
                                        The organization contributed to ≥2% of the total revenue
                                        contributed by Superchain members in the last Season
                                    </li>
                                    <li>
                                        You&apos;ve added email in Atlas.{" "}
                                        <Link href="/profile/details" className="underline">
                                            Add your email
                                        </Link>
                                    </li>
                                    <li>
                                        You&apos;ve added a governance address in Atlas.{" "}
                                        <Link
                                            href="/profile/verified-addresses"
                                            className="underline"
                                        >
                                            Add an address
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="border-b border-border-secondary w-full"></div>
                            <div>
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

                <div className="lg:col-span-1 mt-12 lg:mt-0">
                    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
                        <div className="w-[64px] h-[64px] bg-black rounded-md"></div>
                        <div className="text-sm font-semibold text-secondary-foreground">
                            [Project] is eligible to become a Citizen
                        </div>
                        <Link href="/citizenship/enroll" className="w-full">
                            <Button className="w-full">Register</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
