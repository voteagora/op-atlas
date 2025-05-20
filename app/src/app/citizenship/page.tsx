import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { sharedMetadata } from "../shared-metadata"
import { Rounds } from "@/components/home/Rounds"
import { getUserById } from "@/db/users"

export const metadata: Metadata = {
    ...sharedMetadata,
    title: "Citizenship - OP Atlas",
    description: "Learn about Optimism Citizenship and how to become a part of the Optimism Collective.",
    openGraph: {
        ...sharedMetadata.openGraph,
        title: "Citizenship - OP Atlas",
        description: "Learn about Optimism Citizenship and how to become a part of the Optimism Collective.",
    },
}

export default async function Page() {

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        redirect("/")
    }

    const user = await getUserById(userId)

    // TODO: Check for qualifications

    return <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
        <div className="mt-8 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
            <h1 className="text-4xl font-semibold">Citizenship</h1>
        </div>
    </main>
}
