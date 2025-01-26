import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { FeedbackButton } from "@/components/common/FeedbackButton"
import Dashboard from "@/components/dashboard"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <Dashboard className="w-full max-w-4xl" />
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
    </main>
  )
}
