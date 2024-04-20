import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Dashboard from "@/components/dashboard"
import { getUserByFarcasterId } from "@/db/users"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserByFarcasterId(session.user.id)
  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <Dashboard className="mt-18 max-w-4xl" user={user} />
    </main>
  )
}
