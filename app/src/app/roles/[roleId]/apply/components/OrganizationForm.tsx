import { User } from "@prisma/client"

type SelectedEntity = {
  name: string
  avatar?: string
  userId?: string
  organizationId?: string
}

export const OrganizationForm = ({
  user,
  roleId,
  selectedEntity,
}: {
  user: User
  roleId: number
  selectedEntity: SelectedEntity
}) => {
  return <div>OrganizationForm - Coming Soon</div>
}
