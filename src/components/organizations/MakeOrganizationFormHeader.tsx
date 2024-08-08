"use client"
import { Organization } from "@prisma/client"
import { Ellipsis } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteUserOrganization } from "@/lib/actions/organizations"
import { useIsOrganizationAdmin } from "@/lib/hooks"
import { OrganizationWithDetails } from "@/lib/types"

import { DeleteOrganizationDialog } from "./DeleteOrganizationDialog"

const MakeOrganizationFormHeader = ({
  organization,
}: {
  organization: OrganizationWithDetails
}) => {
  const router = useRouter()
  const isAdmin = useIsOrganizationAdmin(organization)
  const [deletingOrganization, setDeletingOrganization] = useState(false)

  const deleteOrganization = async () => {
    if (!organization) return

    const result = await deleteUserOrganization(organization.id)
    if (result.error) {
      toast.error("There was an error deleting this project.")
    }

    setDeletingOrganization(false)
    router.push("/")
  }

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-foreground text-2xl font-semibold">
        {organization?.name}
      </h2>
      {!!organization && isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="ml-auto">
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setDeletingOrganization(true)}
              className="cursor-pointer"
            >
              Delete organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {deletingOrganization && (
        <DeleteOrganizationDialog
          open
          onConfirm={deleteOrganization}
          onOpenChange={(open) => !open && setDeletingOrganization(false)}
        />
      )}
    </div>
  )
}

export default MakeOrganizationFormHeader
