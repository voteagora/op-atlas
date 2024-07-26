import { Ellipsis } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserById } from "@/db/users"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/")
  }
  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <div className="flex items-center justify-center">
        <h2 className="text-foreground text-2xl font-semibold">
          The Puky Cats
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="ml-auto">
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/profile/details">
              <DropdownMenuItem className="cursor-pointer">
                Edit your profile
              </DropdownMenuItem>
            </Link>
            <Link href="profile/organizations/new">
              <DropdownMenuItem className="cursor-pointer">
                Make an organization
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <MakeOrganizationForm user={user} />
    </div>
  )
}
